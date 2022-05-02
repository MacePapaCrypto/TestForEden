
import Model, { Type } from '../base/model';
import UserModel from './user';

/**
 * export model
 */
@Type('follow')
export default class FollowModel extends Model {

  /**
   * creates follower account
   *
   * @param from 
   * @param to 
   */
  static async create(from, to) {
    // is following
    const alreadyFollowing = await FollowModel.isFollwoing(from, to);

    // if not following
    if (alreadyFollowing) return alreadyFollowing;

    // create follower
    const actualFollower = new FollowModel({
      from,
      to,
      refs : [
        `follow:${from}:${to}`,
        `follower:account:${to}`,
        `following:account:${from}`,
      ]
    });

    // save follower
    await actualFollower.save();

    // from background
    const fromBackground = async () => {
      // lock
      const fromLock = await FollowModel.pubsub.lock(from);

      // load accounts
      const fromAccount = await UserModel.findById(from) || new UserModel({
        id : from,
      });
      
      // add account
      fromAccount.set('count.following', (fromAccount.get('count.following') || 0) + 1);
      fromAccount.save();

      // unlock
      fromLock();
    };
    fromBackground();

    // to background
    const toBackground = async () => {
      // lock
      const toLock = await FollowModel.pubsub.lock(to);

      // load accounts
      const toAccount = await UserModel.findById(to) || new UserModel({
        id : to,
      });
      
      // add account
      toAccount.set('count.followers', (toAccount.get('count.followers') || 0) + 1);
      toAccount.save();

      // unlock
      toLock();
    };
    toBackground();

    // return follower
    return actualFollower;
  }

  /**
   * removes follower
   */
  remove() {
    // super
    const removing = super.remove();

    // from background
    const fromBackground = async () => {
      // lock
      const fromLock = await FollowModel.pubsub.lock(this.__data.from);

      // load accounts
      const fromAccount = await UserModel.findById(this.__data.from) || new UserModel({
        id : this.__data.from,
      });
      
      // add account
      fromAccount.set('count.following', (fromAccount.get('count.following') || 0) + 1);
      fromAccount.save();

      // unlock
      fromLock();
    };
    fromBackground();

    // to background
    const toBackground = async () => {
      // lock
      const toLock = await FollowModel.pubsub.lock(this.__data.to);

      // load accounts
      const toAccount = await UserModel.findById(this.__data.to) || new UserModel({
        id : this.__data.to,
      });
      
      // add account
      toAccount.set('count.followers', (toAccount.get('count.followers') || 0) + 1);
      toAccount.save();

      // unlock
      toLock();
    };
    toBackground();

    // remove
    return removing;
  }

  /**
   * is following account
   *
   * @param from 
   * @param to 
   */
  static async isFollwoing(from, to) {
    // find by ref
    return (await FollowModel.findByRef(`follow:${from}:${to}`) || [])[0];
  }
  
  /**
   * find contexts by account
   *
   * @param account 
   */
  static findFollowers(account, ...args) {
    // find by ref
    return FollowModel.findByRef(`follower:account:${account}`, ...args);
  }
  
  /**
   * find contexts by account
   *
   * @param account 
   */
  static findFollowing(account, ...args) {
    // find by ref
    return FollowModel.findByRef(`following:account:${account}`, ...args);
  }
}