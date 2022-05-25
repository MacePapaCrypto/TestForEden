
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('contract', 'nft')
export default class ContractModel extends Model {
  
  // find by owner
  static findByAccount(account) {
    // find by ref
    return ContractModel.findByRef(`account:${account}`.toLowerCase());
  }
  
  // find by owner
  static async findByAddress(address) {
    // find by ref
    return (await ContractModel.findByRef(`address:${address}`.toLowerCase(), 1) || [])[0];
  }

  /**
   * to json
   * 
   * @param cache 
   * @param small 
   */
  async toJSON(cache = {}, small = false) {
    // super
    const sanitised = await super.toJSON();

    // if small
    if (small) {
      // allowed keys
      const allowed = ['id', 'name', 'account', 'provider', 'createdAt', 'description', 'links', 'images'];

      // loop sanitised
      Object.keys(sanitised).forEach((key) => {
        // check key
        if (allowed.includes(key)) return;

        // delete
        delete sanitised[key];
      });
    }

    // return sanitised
    return sanitised;
  }
}