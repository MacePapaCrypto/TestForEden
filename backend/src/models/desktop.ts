
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('desktop')
export default class DesktopModel extends Model {

  /**
   * find by segment
   *
   * @param segment
   * @param args
   *
   * @returns 
   */
  static findByAccount(account, ...args) {
    // find by ref
    return DesktopModel.findByRef(`account:${account}`, ...args);
  }

  /**
   * find by segment
   *
   * @param segment
   * @param args
   *
   * @returns 
   */
  static findBySession(session, ...args) {
    // find by ref
    return DesktopModel.findByRef(`session:${session}`, ...args);
  }

  /**
   * get default
   */
  static async getDefault() {
    // find by ref
    return (await DesktopModel.findByRef('default', 1))[0];
  }

}