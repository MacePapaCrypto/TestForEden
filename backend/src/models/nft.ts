
import ContractModel from './contract';
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
    return ContractModel.findById(`${this.get('chain')}:${this.get('contract')}`.toLowerCase());
  }

  /**
   * toJSON
   *
   * @param transactions 
   */
  async toJSON(cache = {}, withContract = false) {
    // run super
    const parsed = await super.toJSON();

    // load contract
    if (withContract && this.get('contract') && !cache[`${this.get('contract')}`.toLowerCase()]) cache[`${this.get('contract')}`.toLowerCase()] = (async () => {
      // get contract
      const actualContract = await this.getContract();

      // return contract
      return actualContract ? await actualContract.toJSON(cache, true) : null;
    })();

    // load contract
    const contract = await cache[`${this.get('contract')}`.toLowerCase()];

    // check contract
    if (contract) parsed.contract = contract;

    // set image url
    if (parsed.image) parsed.image.url = `https://media.dashup.com/${this.get('chain')}-${this.get('contract')}-${this.get('tokenId')}`;

    // return
    return parsed;
  }
}