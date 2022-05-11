
import Model, { Type } from '../base/model';
import RoleModel from './role';
import SegmentModel from './segment';

/**
 * export model
 */
@Type('member')
export default class MemberModel extends Model {

  /**
   * get roles
   *
   * @returns 
   */
  async getRoles() {
    // get roles
    const roles = Array.from(new Set(this.get('roles') || []));

    // map
    return (await Promise.all(roles.map((id) => RoleModel.findById(id)))).filter((r) => r);
  }

  /**
   * get roles
   *
   * @returns 
   */
  getSegment() {
    // return segment
    return SegmentModel.findById(this.get('segment'));
  }
  
  /**
   * find segments by account
   *
   * @param account 
   */
  static findByAccount(account, ...args) {
    // find by ref
    return MemberModel.findByRef(`account:${account}`, ...args);
  }
  
  /**
   * find segments by account
   *
   * @param account 
   */
  static async findByAccountSegment(account, segment, ...args) {
    // find by ref
    return (await MemberModel.findByRef(`account:${account}:${segment}`, ...args))[0];
  }

  /**
   * find by role
   *
   * @param role
   * @param args
   *
   * @returns 
   */
  static findByRole(role, ...args) {
    // find by ref
    return MemberModel.findByRef(`role:${role}`, ...args);
  }

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
    return MemberModel.findByRef(`segment:${segment}`, ...args);
  }
}