
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('role')
export default class RoleModel extends Model {

  /**
   * find by segment
   *
   * @param segment
   * @param args
   *
   * @returns 
   */
  static findBySegment(segment, ...args) {
    // find by ref
    return RoleModel.findByRef(`segment:${segment}`, ...args);
  }
}