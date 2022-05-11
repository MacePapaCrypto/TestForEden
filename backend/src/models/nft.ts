
import CollectionModel from './collection';
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('nft', 'nft')
export default class NFTModel extends Model {
  
  // find by owner
  static findByCreator(creator) {
    // find by ref
    return NFTModel.findByRef(`creator:${creator}`);
  }

  // find by address
  static findByContract(contract) {
    // find by ref
    return NFTModel.findByRef(`contract:${contract}`);
  }

  // find by address
  getContract() {
    // find by ref
    return CollectionModel.findById(`${this.get('contract')}`.toLowerCase());
  }

  /**
   * toJSON
   *
   * @param transactions 
   */
  async toJSON(cache = {}, transactions = [], count = null) {
    // run super
    const parsed = await super.toJSON();

    // load contract
    if (this.get('contract') && !cache[`contract:${this.get('contract')}`.toLowerCase()]) cache[`contract:${this.get('contract')}`.toLowerCase()] = (async () => {
      // get contract
      const actualContract = await this.getContract();

      // return contract
      return await actualContract.toJSON(cache, true);
    })();

    // load contract
    const contract = await cache[`contract:${this.get('contract')}`.toLowerCase()];

    // check contract
    if (contract) parsed.contract = contract;

    // set transactions
    parsed.amount = count ? count : undefined;
    parsed.transactions = transactions || [];

    // return
    return parsed;
  }
}