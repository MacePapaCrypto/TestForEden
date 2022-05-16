
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('role', 'space')
export default class RoleModel extends Model {

  /**
   * find by segment
   *
   * @param segment
   * @param args
   *
   * @returns 
   */
  static findBySpace(id, ...args) {
    // find by ref
    return RoleModel.findByRef(`space:${id}`, ...args);
  }
}