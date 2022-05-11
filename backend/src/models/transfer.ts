
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('transfer', 'nft')
export default class NFTTransfer extends Model {
  
  // find by owner
  static findByTo(address) {
    // find by ref
    return NFTTransfer.findByRef(`to:${address}`);
  }

  // find by address
  static findByFrom(address) {
    // find by ref
    return NFTTransfer.findByRef(`from:${address}`);
  }

  // find by address
  static findByHash(hash) {
    // find by ref
    return NFTTransfer.findByRef(`hash:${hash}`);
  }

  // find by address
  static findByContract(contract) {
    // find by ref
    return NFTTransfer.findByRef(`contract:${contract}`);
  }

  // find by address
  static findByContractToken(contract, tokenId) {
    // find by ref
    return NFTTransfer.findByRef(`contract:${contract}:${tokenId}`);
  }
}