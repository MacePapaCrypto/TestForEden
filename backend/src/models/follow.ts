
import Model, { Type } from '../base/model';
import SpaceModel from './space';
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
  static async addFollower(from, to, modelType = 'user') {
    // lower the case
    to = to.toLowerCase();
    from = from.toLowerCase();

    // load accounts
    const toModel = (
      (modelType === 'user' && await UserModel.findById(to)) ||
      (modelType === 'space' && await SpaceModel.findById(to))
    );

    // check to model
    if (!toModel) return;

    // is following
    const alreadyFollowing = await FollowModel.isFollwoing(from, to);

    // if not following
    if (alreadyFollowing) return [alreadyFollowing, (toModel.get('count.followers') || 0)];

    // count
    const newCount = (toModel.get('count.followers') || 0) + 1;

    // create follower
    const actualFollower = new FollowModel({
      id : `${from}:${to}`.toLowerCase(),

      to,
      from,
      modelType,

      refs : [
        `follow:${[from, to].sort().join(':')}`,
        `follower:${to}`,
        `following:${from}`,
      ].map((ref) => ref.toLowerCase())
    });

    // save follower
    await actualFollower.save(null, true);

    // from background
    const bgFollow = Promise.all([
      (async () => {
        // lock
        const fromLock = await FollowModel.pubsub.lock(from);
  
        // try/catch
        try {
          // load accounts
          const fromAccount = await UserModel.findById(from) || new UserModel({
            id : from,
          });
          
          // add account
          fromAccount.set('count.following', (fromAccount.get('count.following') || 0) + 1);
          await fromAccount.save();
        } catch (e) {}
  
        // unlock
        fromLock();
      })(),
      (async () => {
        // lock
        const toLock = await FollowModel.pubsub.lock(to);

        // load accounts
        const lockedToModel = (
          (modelType === 'user' && await UserModel.findById(to)) ||
          (modelType === 'space' && await SpaceModel.findById(to))
        );
  
        // try/catch
        try {

          // check to
          if (lockedToModel) {
            lockedToModel.set('count.followers', (lockedToModel.get('count.followers') || 0) + 1);
            await lockedToModel.save();
          }
        } catch (e) {}
  
        // unlock
        toLock();
      })()
    ]);

    // return follower
    return [actualFollower, newCount];
  }

  /**
   * removes follower
   */
  async remove() {
    // super
    const removing = super.remove();

    // to
    const to = this.__data.to.toLowerCase();
    const from = this.__data.from.toLowerCase();
    const modelType = this.__data.modelType;

    // load accounts
    const toModel = (
      (modelType === 'user' && await UserModel.findById(to)) ||
      (modelType === 'space' && await SpaceModel.findById(to))
    );

    // check to model
    if (!toModel) return;

    // get count
    let newCount = (toModel.get('count.followers') || 0) - 1;
    newCount = newCount < 0 ? 0 : newCount;

    // from background
    const bgFollow = Promise.all([
      (async () => {
        // lock
        const fromLock = await FollowModel.pubsub.lock(from);
  
        // try/catch
        try {
          // load accounts
          const fromAccount = await UserModel.findById(from) || new UserModel({
            id : from,
          });

          // get count
          let updateCount = (fromAccount.get('count.following') || 0) - 1;
          updateCount = updateCount < 0 ? 0 : updateCount;
          
          // add account
          fromAccount.set('count.following', updateCount);
          await fromAccount.save();
        } catch (e) {}
  
        // unlock
        fromLock();
      })(),
      (async () => {
        // lock
        const toLock = await FollowModel.pubsub.lock(to);

        // load accounts
        const lockedToModel = (
          (modelType === 'user' && await UserModel.findById(to)) ||
          (modelType === 'space' && await SpaceModel.findById(to))
        );

        // get count
        let updateCount = (lockedToModel.get('count.followers') || 0) - 1;
        updateCount = updateCount < 0 ? 0 : updateCount;
  
        // try/catch
        try {
          // check to
          if (lockedToModel) {
            lockedToModel.set('count.followers', updateCount);
            await lockedToModel.save();
          }
        } catch (e) {}
  
        // unlock
        toLock();
      })()
    ]);

    // remove
    return [removing, newCount];
  }

  /**
   * is following account
   *
   * @param from 
   * @param to 
   */
  static isFollwoing(from, to) {
    // find by ref
    return FollowModel.findById(`${from}:${to}`.toLowerCase());
  }
  
  /**
   * find contexts by account
   *
   * @param from 
   */
  static async findFollow(to, from, ...args) {
    // key
    const key = `follow:${[from.toLowerCase(), to.toLowerCase()].sort().join(':')}`;

    // find by ref
    return (await FollowModel.findByRef(`follow:${key}`, ...args))[0];
  }
  
  /**
   * find contexts by account
   *
   * @param from 
   */
  static findFollowers(from, ...args) {
    // find by ref
    return FollowModel.findByRef(`follower:${from}`, ...args);
  }
  
  /**
   * find contexts by account
   *
   * @param to 
   */
  static findFollowing(to, ...args) {
    // find by ref
    return FollowModel.findByRef(`following:${to}`, ...args);
  }
}