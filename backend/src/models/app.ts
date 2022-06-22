
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('app')
export default class AppModel extends Model {
  
  /**
   * find by package
   *
   * @param name 
   * @returns 
   */
  static async findByPackage(name) {
    // find by package
    return (await AppModel.findByRef(`package:${name.toLowerCase()}`, 1))[0];
  }
}