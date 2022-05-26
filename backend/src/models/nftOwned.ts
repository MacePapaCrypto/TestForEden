
import Model, { Type } from '../base/model';
import NFTModel from './nft';

/**
 * export model
 */
@Type('nftOwned', 'balance')
export default class NFTOwned extends Model {
  
  // find by address
  static findByHash(hash, ...args) {
    // find by ref
    return NFTOwned.findByRef(`hash:${hash}`.toLowerCase(), ...args);
  }
  
  // find by owner
  static findByOwner(address, ...args) {
    // find by ref
    return NFTOwned.findByRef(`owned:${address}`.toLowerCase(), ...args);
  }

  /**
   * gets nft model
   */
  getNFT() {
    // return nft
    return NFTModel.findById(this.get('nft'));
  }

  /**
   * toJSON
   *
   * @param transactions 
   */
  async toJSON(cache = {}, withContract = false) {
    // load contract
    if (this.get('nft') && !cache[`${this.get('nft')}`.toLowerCase()]) cache[`${this.get('nft')}`.toLowerCase()] = (async () => {
      // get contract
      const actualNFT = await this.getNFT();

      // return contract
      return actualNFT ? await actualNFT.toJSON(cache, withContract) : null;
    })();

    // load contract
    const nft = await cache[`${this.get('nft')}`.toLowerCase()] || {};

    // return parsed
    return {
      ...nft,

      txs       : this.get('txs') || [],
      amount    : this.get('amount'),
      createdAt : this.get('createdAt'),
      updatedAt : this.get('updatedAt'),
    };
  }
}