
import NFTModel from './nft';
import RoleModel from './role';
import MemberModel from './member';
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('space', 'space')
export default class SpaceModel extends Model {

  /**
   * get roles
   *
   * @returns 
   */
  getImage() {
    // return roles
    return this.get('image') && NFTModel.findById(this.get('image'));
  }

  /**
   * get roles
   *
   * @returns 
   */
  getRoles(...args) {
    // return roles
    return RoleModel.findBySpace(this.id, ...args);
  }

  /**
   * get segment
   * 
   * @returns 
   */
  getParent() {
    // get segment
    return this.get('space') && SpaceModel.findById(this.get('space'));
  }

  /**
   * get segment
   * 
   * @returns 
   */
  getMember(account) {
    // get segment
    return MemberModel.findByAccountSpace(account, this.id);
  }
  
  /**
   * find segments by segment
   *
   * @param segment 
   */
   static getChildren(...args) {
    // find by ref
    return SpaceModel.findByRef(`space:${this.id}`, ...args);
  }
  
  /**
   * find contexts by account
   *
   * @param account 
   */
  static findBySpace(space, ...args) {
    // find by ref
    return SpaceModel.findByRef(`space:${space}`, ...args);
  }
  
  /**
   * find contexts by account
   *
   * @param account 
   */
  static findByAccount(account, ...args) {
    // find by ref
    return SpaceModel.findByRef(`account:${account}`, ...args);
  }

  /**
   * to json
   *
   * @param cache 
   * @param account 
   */
  async toJSON(cache = {}, account = null, small = false) {
    // get parent
    const parentJSON = await super.toJSON();

    // get roles
    if (!small && !cache[`${this.id}.roles`]) cache[`${this.id}.roles`] = (async () => {
      // get roles
      const roles = await this.getRoles();

      // sanitise roles
      return await Promise.all(roles.map((role) => role.toJSON(cache)));
    })();

    // get roles
    if (!small && !cache[`${this.id}.image`]) cache[`${this.id}.image`] = (async () => {
      // get roles
      const image = await this.getImage();

      // sanitise roles
      return image ? image.toJSON() : null;
    })();

    // account id
    const accountId = typeof account === 'string' ? account : account?.id;

    // get roles
    if (accountId && !cache[`${accountId}.${this.id}`]) cache[`${accountId}.${this.id}`] = (async () =>{
      // get roles
      const actualMember = account instanceof MemberModel ? account : await this.getMember(accountId);

      // return
      return actualMember ? await actualMember.toJSON(cache) : null;
    })();

    // roles
    const [
      spaceRoles,
      spaceImage,
      spaceMember,
    ] = await Promise.all([
      !small ? await cache[`${this.id}.roles`] : null,
      !small ? await cache[`${this.id}.image`] : null,
      !small ? await cache[`${accountId}.${this.id}`] : null,
    ]);

    // return json
    return {
      ...parentJSON,
      roles  : spaceRoles,
      image  : spaceImage,
      member : spaceMember,

      ...(spaceMember?.value || {}),
    };
  }
}