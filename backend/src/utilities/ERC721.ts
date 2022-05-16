
// import models
import fetch from 'node-fetch';
import { ethers } from 'ethers';
import ftmscan from './ftmscan';
import NftModel from '../models/nft';
import OwnedModel from '../models/owned';
import Bottleneck from 'bottleneck';
import ftmProvider from './ftmProvider';
import CollectionModel from '../models/collection';

/**
 * create utility
 */
class ERC721Utility {
  // parse bottleneck
  private __parseBottleneck = new Bottleneck({
    maxConcurrent : 50,
  });
  private __parsing = [];

  /**
   * loads in owned nfts
   *
   * @param address 
   * @returns 
   */
  async loadAllOwned(address) {
    // lower address
    const lowerAddress = `${address}`.toLowerCase();

    // check parsing
    if (this.__parsing.includes(lowerAddress)) return;
    this.__parsing.push(lowerAddress);

    // load transactions from api
    const transactions = await ftmscan.getNFTTransactions(lowerAddress, {
      offset : 10000, // max 10k per
    });

    // parse out transaction
    const parsedTransactions = (await Promise.all(transactions.map((tx) => this.__parseBottleneck.schedule(async () => {
      // try/catch
      try {
        // get nft
        return await this.getNFT(tx.contractAddress, tx.tokenID);
      } catch (e) {}
    })))).filter((t) => t);

    // reduce
    const ownedNFTs = await Promise.all(Object.values(transactions.reduce((accum, tx) => {
      // get id
      const id = `${tx.contractAddress}:${tx.tokenID}`.toLowerCase();

      // find parsed
      const nft = parsedTransactions.find((t) => t.get('id') === id);

      // check parsed
      if (!nft) return accum;

      // check exists
      if (!accum[id]) accum[id] = {
        nft,
        txs   : [],
        count : 0,
      };

      // get direction
      const received = `${tx.to}`.toLowerCase() === lowerAddress;

      // add to accum count
      accum[id].txs.push(tx);
      accum[id].count = received ? (accum[id].count + 1) : (accum[id].count - 1);

      // return accum
      return accum;
    }, {})).filter((item) => item.count > 0));

    // owned
    const actualOwnedArr = [];

    // map
    await Promise.all(ownedNFTs.map((nft) => this.__parseBottleneck.schedule(async () => {
      // create new ownership
      const actualOwned = await OwnedModel.findByContractTokenOwner(nft.nft.get('contract'), nft.nft.get('tokenId'), address) || new OwnedModel({
        id       : `${nft.nft.get('contract')}:${nft.nft.get('tokenId')}:${address}`.toLowerCase(),
        nft      : nft.nft.get('id'),
        tokenId  : nft.nft.get('tokenId'),
        contract : nft.nft.get('contract'),
      });

      // push new id
      actualOwnedArr.push(`${nft.nft.get('contract')}:${nft.nft.get('tokenId')}:${address}`);

      // set details
      actualOwned.set('txs', nft.txs.map((tx) => {
        // get direction
        const received = `${tx.to}`.toLowerCase() === lowerAddress;
        
        // create hash
        return `${received ? 'received' : 'sent'}:${tx.hash}:${tx.transactionIndex}`;
      }));
      actualOwned.set('count', nft.count);
      actualOwned.set('createdAt', new Date(parseInt(nft.txs.sort((a, b) => {
        // sort
        const aS = parseInt(a.timeStamp);
        const bS = parseInt(b.timeStamp);

        // sort
        if (aS > bS) return 1;
        if (aS < bS) return -1;
        return 0;
      })[0].timeStamp) * 1000));

      // set nfts
      actualOwned.set('refs', Array.from(new Set([
        ...(nft.txs.reduce((accum, tx) => {
          // refs
          const refs = [
            `to:${tx.to}`,
            `hash:${tx.hash}`,
            `from:${tx.from}`,
            `symbol:${tx.tokenSymbol}`,
            `contract:${tx.contractAddress}`,
            `hash:${tx.hash}:${tx.transactionIndex}`,
            `contract:${tx.contractAddress}:${tx.transactionIndex}`,
          ].map((item) => item.toLowerCase());

          // push
          refs.forEach((ref) => {
            if (accum.includes(ref)) return;
            accum.push(ref);
          });

          // return accum
          return accum;
        }, [])),

      ])));

      // save
      await actualOwned.save();
    })));

    // load existing
    const owned = await OwnedModel.findByOwner(lowerAddress);

    // loop owned
    await Promise.all(owned.map(async (item) => {
      // check id
      if (actualOwnedArr.includes(item.get('id'))) return;

      // delete
      await item.remove();
    }));

    // remove
    this.__parsing = this.__parsing.filter((p) => p !== lowerAddress);
  }

  /**
   * gets ERC721 contract
   *
   * @param contract 
   */
  async getContract(contract) {
    // load from db
    const actualContract = await CollectionModel.findById(`${contract}`.toLowerCase());

    // check contract supported
    if (!actualContract) return null;
    if (!actualContract.get('abi')) return null;

    // create ethers contract
    return actualContract;
  }

  /**
   * gets NFT from contract
   *
   * @param contract
   * @param tokenId 
   */
  async getNFT(contract, tokenId = '0') {
    // tryh/catch
    try {
      // nft id
      const nftId = `${contract}:${tokenId}`.toLowerCase();

      // find by nft model
      const nftModel = await NftModel.findById(nftId) || new NftModel({
        id : nftId,

        tokenId,
        contract,
      });

      // check uri
      if (!nftModel.get('uri')) {
        // get contract
        const actualContract = await this.getContract(contract);

        // check contract
        if (!actualContract) return null;

        // create contract
        const ERC721Contract = new ethers.Contract(actualContract.get('id'), actualContract.get('abi'), ftmProvider);

        // get token uri
        let tokenURI = await ERC721Contract.functions.tokenURI(tokenId);
            tokenURI = Array.isArray(tokenURI) ? tokenURI[0] : tokenURI;

        // load actual model
        nftModel.set('uri', tokenURI);

        // data
        const NFTReq = await fetch(tokenURI.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/'));
        const NFTDat = await NFTReq.json();

        // image
        const NFTRes = NFTDat.image && await fetch(NFTDat.image.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/'), {
          method : 'HEAD'
        });
        const NFTImage = NFTRes ? {
          url  : NFTDat.image.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/'),
          type : NFTRes.headers.get('content-type'),
          size : NFTRes.headers.get('content-length'),
        } : {};

        // set value
        nftModel.set('refs', [
          `contract:${contract}`.toLowerCase(),
          `account:${actualContract.get('account')}`.toLowerCase(),
        ]);
        nftModel.set('value', NFTDat);
        nftModel.set('image', NFTImage);

        // save nft model
        await nftModel.save();
      }

      // return nft model
      return nftModel;
    } catch (e) {}
  }
}

export default new ERC721Utility();