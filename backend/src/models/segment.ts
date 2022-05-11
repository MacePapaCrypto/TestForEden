
import Model, { Type } from '../base/model';
import RoleModel from './role';
import MemberModel from './member';

/**
 * export model
 */
@Type('segment')
export default class SegmentModel extends Model {

  /**
   * get roles
   *
   * @returns 
   */
  getRoles(...args) {
    // return roles
    return RoleModel.findBySegment(this.get('id'), ...args);
  }
  
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

  /**
   * to json
   *
   * @param cache 
   * @param account 
   */
  async toJSON(cache = {}, account = null) {
    // get parent
    const parentJSON = await super.toJSON();

    // get roles
    if (!cache[`${this.id}.roles`]) cache[`${this.id}.roles`] = new Promise(async (resolve) => {
      // get roles
      const roles = await this.getRoles();

      // sanitise roles
      resolve(await Promise.all(roles.map((role) => role.toJSON(cache))));
    });

    // roles
    const segmentRoles = await cache[`${this.id}.roles`];
    const segmentMember = account instanceof MemberModel ? account : (typeof account === 'string' ? await MemberModel.findByAccountSegment(account, this.id) : null);

    // sanitised member
    const sanitisedMember = segmentMember ? await segmentMember.toJSON(cache) : null;

    // return json
    return {
      ...parentJSON,
      roles  : segmentRoles,
      member : sanitisedMember,

      ...(sanitisedMember?.value || {}),
    };
  }
}