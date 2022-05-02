
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('segment')
export default class SegmentModel extends Model {
  
  /**
   * find segments by account
   *
   * @param account 
   */
  static findByAccount(account, ...args) {
    // find by ref
    return SegmentModel.findByRef(`account:${account}`, ...args);
  }
  
  /**
   * find segments by session
   *
   * @param session 
   */
   static findBySession(session, ...args) {
    // find by ref
    return SegmentModel.findByRef(`session:${session}`, ...args);
  }
}