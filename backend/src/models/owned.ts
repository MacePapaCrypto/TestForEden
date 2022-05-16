
import Model, { Type } from '../base/model';
import NFTModel from './nft';

/**
 * export model
 */
@Type('owned', 'own')
export default class NFTOwned extends Model {

  // find by address
  static findByFrom(address, ...args) {
    // find by ref
    return NFTOwned.findByRef(`from:${address}`.toLowerCase(), ...args);
  }

  // find by address
  static findByHash(hash, ...args) {
    // find by ref
    return NFTOwned.findByRef(`hash:${hash}`.toLowerCase(), ...args);
  }
  
  // find by owner
  static findByTo(address, ...args) {
    // find by ref
    return NFTOwned.findByRef(`to:${address}`.toLowerCase(), ...args);
  }
  
  // find by owner
  static findByOwner(address, ...args) {
    // find by ref
    return NFTOwned.findByRef(`to:${address}`.toLowerCase(), ...args);
  }

  // find by address
  static findByContract(contract, ...args) {
    // find by ref
    return NFTOwned.findByRef(`contract:${contract}`.toLowerCase(), ...args);
  }

  // find by address
  static findByContractToken(contract, tokenId, ...args) {
    // find by ref
    return NFTOwned.findByRef(`contract:${contract}:${tokenId}`.toLowerCase(), ...args);
  }

  /**
   * gets nft model
   */
  getNFT() {
    // return nft
    return NFTModel.findById(this.get('nft'));
  }

  /**
   * find by token owner
   *
   * @param contract 
   * @param tokenId 
   * @param address 
   * @returns 
   */
  static findByContractTokenOwner(contract, tokenId, address) {
    // return find by id
    return NFTOwned.findById(`${contract}:${tokenId}:${address}`.toLowerCase());
  }

  /**
   * toJSON
   *
   * @param transactions 
   */
  async toJSON(cache = {}) {
    // load contract
    if (this.get('nft') && !cache[`${this.get('nft')}`.toLowerCase()]) cache[`${this.get('nft')}`.toLowerCase()] = (async () => {
      // get contract
      const actualNFT = await this.getNFT();

      // return contract
      return await actualNFT.toJSON(cache);
    })();

    // load contract
    const nft = await cache[`${this.get('nft')}`.toLowerCase()] || {};

    // return parsed
    return {
      ...nft,

      txs       : this.get('txs') || [],
      count     : this.get('count'),
      createdAt : this.get('createdAt'),
      updatedAt : this.get('updatedAt'),
    };
  }
}