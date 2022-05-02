
import Model, { Type } from '../base/model';
import SegmentModel from './segment';

/**
 * export model
 */
@Type('context')
export default class ContextModel extends Model {

  /**
   * get segment
   * 
   * @returns 
   */
  getSegment() {
    // get segment
    return SegmentModel.findById(this.get('segment'));
  }
  
  /**
   * find contexts by account
   *
   * @param account 
   */
  static findByAccount(account, ...args) {
    // find by ref
    return ContextModel.findByRef(`account:${account}`, ...args);
  }
  
  /**
   * find segments by segment
   *
   * @param segment 
   */
   static findBySegment(segment, ...args) {
    // find by ref
    return ContextModel.findByRef(`segment:${segment}`, ...args);
  }
}