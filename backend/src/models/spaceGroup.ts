
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('spaceGroup', 'space')
export default class SpaceGroupModel extends Model {
  
  /**
   * find contexts by account
   *
   * @param account 
   */
  static findByAccount(account, ...args) {
    // find by ref
    return SpaceGroupModel.findByRef(`account:${account}`, ...args);
  }
  
  /**
   * find contexts by space
   *
   * @param space 
   */
  static findBySpace(space, ...args) {
    // find by ref
    return SpaceGroupModel.findByRef(`space:${space}`, ...args);
  }
}