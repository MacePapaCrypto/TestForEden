
// import models
import fetch from 'node-fetch';
import { ethers } from 'ethers';
import config from '../config';
import moralis from '../apis/moralis';
import Bottleneck from 'bottleneck';
import { AbortController } from 'node-abort-controller';

// models
import NftModel from '../models/nft';
import UserModel from '../models/user';
import NftOwnedModel from '../models/nftOwned';
import ContractModel from '../models/contract';

// *scans
import ftmScan from '../apis/fantom';
import ethScan from '../apis/ethereum';
import avaScan from '../apis/avalanche';
import bscScan from '../apis/binance';
import mtcScan from '../apis/polygon';

// providers
import avaProvider from '../providers/avalanche';
import ftmProvider from '../providers/fantom';
import ethProvider from '../providers/ethereum';
import mtcProvider from '../providers/polygon';
import bscProvider from '../providers/binance';

// timeout
const fetchTimeout = async (resource, options = {}) => {
  // create timeout
  const { timeout = 8000 } = options;
  
  // create request
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });

  // clear
  clearTimeout(id);

  // return
  return response;
};

/**
 * create utility
 */
class ERC721Contract {
  // set loading
  private __loading = {};
  private __nftBottleneck = new Bottleneck({
    maxConcurrent : config.get('bottleneck.nft'),
  });
  private __ownedBottleneck = new Bottleneck({
    maxConcurrent : config.get('bottleneck.owned'),
  });
  private __contractBottleneck = new Bottleneck({
    maxConcurrent : config.get('bottleneck.contract'),
  });

  /**
   * loads all nfts
   *
   * @param address
   */
  async loadOwned(address, ...args) {
    // lower
    const lowerAddress = address.toLowerCase();

    // syncing
    (async () => {
      // create lock
      const unlock = await NftOwnedModel.pubsub.lock(lowerAddress);

      // try/catch
      try {
        // load user model
        const userModel = await UserModel.findById(lowerAddress) || new UserModel({
          id : lowerAddress,
        });

        // set count
        userModel.set('sorts', Array.from(new Set([
          ...(userModel.get('sorts') || []),
          `syncing.nfts`
        ])));
        userModel.set('synced.nfts', false);
        userModel.set('syncing.nfts', new Date());
        await userModel.save();
      } catch (e) {}

      // unlock
      unlock();
    })();

    // get owns
    // @todo this should be replaced with a new API @ewhal4
    const allOwns = await moralis.getOwns(lowerAddress, ...args);

    // loop
    const result = (await Promise.all(allOwns.map((owned) => this.loadNFTOwned(owned)))).filter((owned) => owned);

    // syncing
    (async () => {
      // create lock
      const unlock = await NftOwnedModel.pubsub.lock(lowerAddress);

      // try/catch
      try {
        // load user model
        const userModel = await UserModel.findById(lowerAddress) || new UserModel({
          id : lowerAddress,
        });

        // set count
        userModel.set('sorts', Array.from(new Set([
          ...(userModel.get('sorts') || []),
          `synced.nfts`
        ])));
        userModel.set('synced.nfts', new Date());
        userModel.set('syncing.nfts', false);
        await userModel.save();
      } catch (e) {}

      // unlock
      unlock();
    })();

    // done syncing
    return result;
  }

  /**
   * gets ERC721 contract
   *
   * @param contract 
   */
  loadContract(address, chain = 'fantom') {
    // contract id
    const contractId = `${chain}:${address}`.toLowerCase();

    // check loading
    if (this.__loading[contractId]) return this.__loading[contractId];

    // create loading
    this.__loading[contractId] = this.__contractBottleneck.schedule(async () => {
      try {
        // load from db
        let actualContract = await ContractModel.findById(contractId);
    
        // check contract
        if (actualContract && actualContract.get('abi')) return actualContract;

        // load contract
        console.log('loading contract', address, chain);
    
        // load contract
        const newContract = actualContract || new ContractModel({
          id      : contractId,
          address : address.toLowerCase(),
          
          chain,

          refs : [
            `chain:${chain}`,
            `address:${address}`.toLowerCase(),
          ]
        });
    
        // get contract
        const contractMeta = await moralis.getContract(newContract.get('address'), chain);

        // load contract
        console.log('loaded contract', address, chain);
    
        // set
        newContract.set('name', contractMeta.name);
        newContract.set('synced', contractMeta.synced);
        newContract.set('symbol', contractMeta.symbol);
        newContract.set('category', contractMeta.type);
    
        // set refs
        newContract.set('refs', Array.from(new Set([
          ...(newContract.get('refs')),
    
          `category:${contractMeta.type}`,
        ])));
    
        // load abi
        if (chain === 'fantom') {
          // get abi
          newContract.set('abi', await ftmScan.getABI(newContract.get('address')));
        } else if (chain === 'ethereum') {
          // get abi
          newContract.set('abi', await ethScan.getABI(newContract.get('address')));
        } else if (chain === 'matic') {
          // get abi
          newContract.set('abi', await mtcScan.getABI(newContract.get('address')));
        } else if (chain === 'binance') {
          // get abi
          newContract.set('abi', await bscScan.getABI(newContract.get('address')));
        } else if (chain === 'avalanche') {
          // get abi
          newContract.set('abi', await avaScan.getABI(newContract.get('address')));
        }

        console.log('TEST', chain, newContract.get('abi'));
    
        // save new contract
        newContract.save();
    
        // create ethers contract
        return newContract;
      } catch (e) { console.log('contract error', e) }
    });

    // then
    this.__loading[contractId].then(() => {
      // timeout kill cache
      setTimeout(() => {
        // delete
        delete this.__loading[contractId];
      }, 30 * 1000);
    });

    // return done
    return this.__loading[contractId];
  }

  /**
   * gets NFT from contract
   *
   * @param nftData
   */
  loadNFT(nftData) {
    // nft id
    const nftId = `${nftData.chain}:${nftData.contract}:${nftData.tokenId}`.toLowerCase();

    // check loading
    if (this.__loading[nftId]) return this.__loading[nftId];

    // create promise
    this.__loading[nftId] = this.__nftBottleneck.schedule(async () => {
      // try/catch
      try {
        // update
        let update = false;

        // parsed data
        const parsedData = { ...nftData };
        delete parsedData.block;
        delete parsedData.amount;
        delete parsedData.account;

        // find by nft model
        const nftModel = await NftModel.findById(nftId) || new NftModel({
          id : nftId,
          
          ...parsedData,
        });

        // get contract
        const actualContract = await this.loadContract(nftData.contract, nftData.chain);

        // check uri
        if (!nftModel.get('uri') && actualContract.get('abi')) {
          // get provider
          let provider;

          // check providers
          if (nftModel.get('chain') === 'fantom') {
            provider = ftmProvider;
          } else if (nftModel.get('chain') === 'ethereum') {
            provider = ethProvider;
          } else if (nftModel.get('chain') === 'binance') {
            provider = bscProvider;
          } else if (nftModel.get('chain') === 'matic') {
            provider = mtcProvider;
          } else if (nftModel.get('chain') === 'avalanche') {
            provider = avaProvider;
          }

          // create contract
          const ERC721Contract = new ethers.Contract(actualContract.get('id'), actualContract.get('abi'), provider);

          // get token uri
          let tokenURI = await ERC721Contract.functions.tokenURI(nftData.tokenId);
              tokenURI = Array.isArray(tokenURI) ? tokenURI[0] : tokenURI;

          // load actual model
          nftModel.set('uri', tokenURI);

          // update
          update = true;
        }

        // check data
        if (!nftModel.get('image')) {
          // data
          const NFTReq = await fetchTimeout(nftModel.get('uri').replace('ipfs://', 'https://moon.mypinata.cloud/ipfs/'), {
            timeout : 30 * 1000,
          });
          const NFTDat = await NFTReq.json();

          // image
          const NFTRes = NFTDat.image && await fetchTimeout(NFTDat.image.replace('ipfs://', 'https://moon.mypinata.cloud/ipfs/'), {
            method  : 'HEAD',
            timeout : 30 * 1000,
          });
          const NFTImage = NFTRes ? {
            url  : NFTDat.image,
            type : NFTRes.headers.get('content-type'),
            size : NFTRes.headers.get('content-length'),
          } : {};

          // set value
          nftModel.set('refs', Array.from(new Set([
            ...(nftModel.get('refs')),
            `hash:${nftModel.get('hash')}`.toLowerCase(),
            `category:${nftModel.get('category')}`,
            `contract:${nftModel.get('contract')}`.toLowerCase(),
          ])));
          nftModel.set('name', NFTDat.name || nftModel.get('name'));
          nftModel.set('image', NFTImage);
          nftModel.set('metadata', NFTDat);

          // update
          update = true;
        }

        // if update
        if (update) nftModel.save();

        // return nft model
        return nftModel;
      } catch (e) { console.log('nft error', e) }
    });

    // then
    this.__loading[nftId].then(() => {
      // timeout kill cache
      setTimeout(() => {
        // delete
        delete this.__loading[nftId];
      }, 30 * 1000);
    });

    // return done
    return this.__loading[nftId];
  }

  /**
   * load owned
   *
   * @param nftData 
   */
  loadNFTOwned(nftData) {
    // owned id
    const ownedId = `${nftData.account}:${nftData.chain}:${nftData.contract}:${nftData.tokenId}`;

    // check loading
    if (this.__loading[ownedId]) return this.__loading[ownedId];

    // create promise
    this.__loading[ownedId] = this.__ownedBottleneck.schedule(async () => {
      // try/catch
      try {
        // get nft
        const actualNFT = await this.loadNFT(nftData);
    
        // check nft model
        if (!actualNFT) return;
        
        // check owned
        let creating = false;
        let ownedNFT = await NftOwnedModel.findById(ownedId);

        // check owned
        if (!ownedNFT) {
          creating = true;
          ownedNFT = new NftOwnedModel({
            id    : ownedId,
            nft   : actualNFT.id,
            sorts : ['contract'],
          });;
        }

        // check missing
        const changed = !!(['hash', 'contract', 'category', 'chain', 'symbol', 'amount', 'account', 'tokenId'].filter((key) => {
          // check key
          if (nftData[key] !== ownedNFT.get(key)) {
            // set
            ownedNFT.set(key, nftData[key]);
            return true;
          }
        })).length;

        // check changed
        if (changed || creating) {
          // set refs
          ownedNFT.set('refs', [
            `account:${nftData.account}`.toLowerCase(),
            `contract:${nftData.contract}`.toLowerCase(),
            `account:${nftData.account}:${nftData.contract}`.toLowerCase(),
          ]);
          ownedNFT.save();
        }

        // create lock
        if (creating) (async () => {
          // create lock
          const unlock = await NftOwnedModel.pubsub.lock(nftData.account.toLowerCase());

          // try/catch
          try {
            // load user model
            const userModel = await UserModel.findById(nftData.account.toLowerCase()) || new UserModel({
              id : nftData.account.toLowerCase(),
            });

            // set count
            userModel.set('count.nfts', (userModel.get('count.nfts') || 0) + (ownedNFT.get('amount') || 1));
            await userModel.save();
          } catch (e) {}

          // unlock
          unlock();
        })();

        // return
        return ownedNFT;
      } catch (e) {}
    });

    // then
    this.__loading[ownedId].then(() => {
      // timeout kill cache
      setTimeout(() => {
        // delete
        delete this.__loading[ownedId];
      }, 30 * 1000);
    });

    // return done
    return this.__loading[ownedId];
  }
}

// new contract
export default new ERC721Contract();