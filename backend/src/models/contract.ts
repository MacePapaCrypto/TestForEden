
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('contract', 'nft')
export default class ContractModel extends Model {
  
  // find by owner
  static findByCreator(creator) {
    // find by ref
    return ContractModel.findByRef(`creator:${creator}`);
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