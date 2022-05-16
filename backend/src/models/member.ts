
import Model, { Type } from '../base/model';
import RoleModel from './role';
import SpaceModel from './space';

/**
 * export model
 */
@Type('member', 'space')
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
  getSpace() {
    // return segment
    return SpaceModel.findById(this.get('space'));
  }

  /**
   * find by segment
   *
   * @param segment
   * @param args
   *
   * @returns 
   */
  static findBySpace(space, ...args) {
    // find by ref
    return MemberModel.findByRef(`space:${space}`, ...args);
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
  static async findByAccountSpace(account, space, ...args) {
    // find by ref
    return (await MemberModel.findByRef(`account:${account}:${space}`.toLowerCase(), ...args))[0];
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
   * add member
   *
   * @param lowerAccount 
   * @param lowerSubject 
   * @returns 
   */
  static async addMember(lowerAccount, lowerSubject) {
    // lowercase
    lowerAccount = lowerAccount.toLowerCase();
    lowerSubject = lowerSubject.toLowerCase();

    // actual space
    const spaceModel = lowerSubject && await SpaceModel.findById(lowerSubject);

    // check to model
    if (!spaceModel) return [];

    // lock
    const spaceLock = await MemberModel.pubsub.lock(lowerSubject);
    const memberLock = await MemberModel.pubsub.lock(`member.${lowerAccount}`);

    // load space
    const actualSpace = await SpaceModel.findById(lowerSubject);

    // new count
    let newCount = (actualSpace.get('count.members') || 0);
    newCount = newCount < 0 ? 0 : newCount;
    let newMember = null;

    // try/catch
    try {
      // load existing member
      newMember = await MemberModel.findByAccountSpace(lowerAccount, actualSpace.id);

      // if existing member
      if (!newMember) {
        // create new member
        newMember = new MemberModel({
          refs    : [
            `space:${actualSpace.id}`,
            `account:${lowerAccount}`,
            `account:${lowerAccount}:${actualSpace.id}`,
          ],
          roles   : [],
          space   : actualSpace.id,
          account : lowerAccount,
        });

        // save member
        await newMember.save();

        // add to member count
        newCount = newCount + 1;

        // update count
        actualSpace.set('count.members', newCount);
        await actualSpace.save();
      }
    } catch (e) {}

    // unlock
    spaceLock();
    memberLock();

    // return
    return [newMember, newCount];
  }

  /**
   * removes follower
   */
  async remove() {
    // super
    const removing = super.remove();

    // actual space
    const spaceModel = this.get('space') && await SpaceModel.findById(this.get('space'));

    // check to model
    if (!spaceModel) return [];

    // get count
    let newCount = (spaceModel.get('count.members') || 0) - 1;
    newCount = newCount < 0 ? 0 : newCount;

    // from background
    const bgFollow = Promise.all([
      (async () => {
        // lock
        const spaceLock = await SpaceModel.pubsub.lock(this.get('space').toLowerCase());
  
        // try/catch
        try {
          // load accounts
          const actualSpace = await SpaceModel.findById(this.get('space'));

          // get count
          let changeCount = (actualSpace.get('count.members') || 0) - 1;
          changeCount = changeCount < 0 ? 0 : changeCount;
              
          // add account
          actualSpace.set('count.members', changeCount);
          await actualSpace.save();
        } catch (e) {}
  
        // unlock
        spaceLock();
      })(),
    ]);

    // remove
    return [removing, newCount];
  }
}