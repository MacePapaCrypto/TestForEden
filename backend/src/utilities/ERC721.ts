
// import models
import fetch from 'node-fetch';
import { ethers } from 'ethers';
import NftModel from '../models/nft';
import ftmProvider from './ftmProvider';
import CollectionModel from '../models/collection';

/**
 * create utility
 */
class ERC721Utility {

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