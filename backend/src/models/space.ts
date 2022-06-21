
import decay from 'decay';
import NFTModel from './nft';
import RoleModel from './role';
import MemberModel from './member';
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('space')
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

  /**
   * Saves the current model
   */
  public async save(noEmission = null): Promise<any> {
    // set sort
    if (!Array.isArray(this.__data.sorts)) this.__data.sorts = [];

    // rank types
    const ranks = [
      'rank.score',
      'rank.reddit',
      'rank.hacker',
      'rank.wilson',
    ];
    // count types
    const counts = [
      'count.likes',
      'count.members',
      'count.followers',
    ];

    // push sorts
    [
      // ranking types
      ...ranks,

      // count types
      ...counts,
    ].forEach((sortKey) => {
      // check and add
      if (!this.__data.sorts.includes(sortKey)) this.__data.sorts.push(sortKey);
    });

    // fix counts
    counts.forEach((count) => {
      // check and default
      if (!this.get(count)) this.set(count, 0);
    });

    // created
    const created = new Date(this.__data.createdAt || new Date());

    // round
    const round = (number) => {
      // return rounded
      return parseFloat(number.toFixed(5));
    };

    // ranking
    const upvoteRanking = (this.get('count.likes') || 0) + ((this.get('count.members') || 0) * 5);
    const downvoteRanking = 0;

    // set rank
    this.set('rank', {
      score  : round(decay.redditHot()(upvoteRanking, downvoteRanking, created)),
      reddit : round(decay.redditHot()(upvoteRanking, downvoteRanking, created)),
      hacker : round(decay.hackerHot()(upvoteRanking, created)),
      wilson : round(decay.wilsonScore()(upvoteRanking, downvoteRanking))
    });

    // return super
    const saving = await super.save(noEmission);

    // return saving
    return saving;
  }
}