
import Model, { Type } from '../base/model';
import UserModel from './user';
import SpaceModel from './space';
import PostModel from './post';

/**
 * export model
 */
@Type('like')
export default class LikeModel extends Model {

  /**
   * creates follower account
   *
   * @param from 
   * @param to 
   */
  static async addLike(from, to, modelType = 'user') {
    // lower the case
    to = to.toLowerCase();
    from = from.toLowerCase();

    // load accounts
    const toModel = (
      (modelType === 'user' && await UserModel.findById(to)) ||
      (modelType === 'post' && await PostModel.findById(to)) ||
      (modelType === 'space' && await SpaceModel.findById(to))
    );

    // check to model
    if (!toModel) return;

    // is following
    const alreadyLiked = await LikeModel.isLiked(from, to);

    // if not following
    if (alreadyLiked) return [alreadyLiked, (toModel.get('count.likes') || 0)];

    // count
    const newCount = (toModel.get('count.likes') || 0) + 1;

    // create follower
    const actualLike = new LikeModel({
      id : `${from}:${to}`.toLowerCase(),

      to,
      from,
      modelType,

      refs : [
        `like:${[from, to].sort().join(':')}`,
        `likes:${to}`,
        `liked:${from}`,
      ].map((ref) => ref.toLowerCase())
    });

    // save follower
    await actualLike.save(null, true);

    // from background
    const bgLike = Promise.all([
      (async () => {
        // lock
        const fromLock = await LikeModel.pubsub.lock(from);
  
        // try/catch
        try {
          // load accounts
          const fromAccount = await UserModel.findById(from) || new UserModel({
            id : from,
          });
          
          // add account
          fromAccount.set('count.liked', (fromAccount.get('count.liked') || 0) + 1);
          await fromAccount.save();
        } catch (e) {}
  
        // unlock
        fromLock();
      })(),
      (async () => {
        // lock
        const toLock = await LikeModel.pubsub.lock(to);

        // load accounts
        const lockedToModel = (
          (modelType === 'user' && await UserModel.findById(to)) ||
          (modelType === 'post' && await PostModel.findById(to)) ||
          (modelType === 'space' && await SpaceModel.findById(to))
        );
  
        // try/catch
        try {

          // check to
          if (lockedToModel) {
            lockedToModel.set('count.likes', (lockedToModel.get('count.likes') || 0) + 1);
            await lockedToModel.save();
          }
        } catch (e) {}
  
        // unlock
        toLock();
      })()
    ]);

    // return follower
    return [actualLike, newCount];
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
      (modelType === 'post' && await PostModel.findById(to)) ||
      (modelType === 'space' && await SpaceModel.findById(to))
    );

    // check to model
    if (!toModel) return;

    // get count
    let newCount = (toModel.get('count.likes') || 0) - 1;
    newCount = newCount < 0 ? 0 : newCount;

    // from background
    const bgLike = Promise.all([
      (async () => {
        // lock
        const fromLock = await LikeModel.pubsub.lock(from);
  
        // try/catch
        try {
          // load accounts
          const fromAccount = await UserModel.findById(from) || new UserModel({
            id : from,
          });

          // get count
          let updateCount = (fromAccount.get('count.liked') || 0) - 1;
          updateCount = updateCount < 0 ? 0 : updateCount;
          
          // add account
          fromAccount.set('count.liked', updateCount);
          await fromAccount.save();
        } catch (e) {}
  
        // unlock
        fromLock();
      })(),
      (async () => {
        // lock
        const toLock = await LikeModel.pubsub.lock(to);

        // load accounts
        const lockedToModel = (
          (modelType === 'user' && await UserModel.findById(to)) ||
          (modelType === 'post' && await PostModel.findById(to)) ||
          (modelType === 'space' && await SpaceModel.findById(to))
        );

        // get count
        let updateCount = (lockedToModel.get('count.likes') || 0) - 1;
        updateCount = updateCount < 0 ? 0 : updateCount;
  
        // try/catch
        try {
          // check to
          if (lockedToModel) {
            lockedToModel.set('count.likes', updateCount);
            await lockedToModel.save();
          }
        } catch (e) {}
  
        // unlock
        toLock();
      })()
    ]);

    // remove
    return [null, newCount];
  }

  /**
   * is following account
   *
   * @param from 
   * @param to 
   */
  static isLiked(from, to) {
    // find by ref
    return LikeModel.findById(`${from}:${to}`.toLowerCase());
  }
  
  /**
   * find contexts by account
   *
   * @param from 
   */
  static async findLike(to, from, ...args) {
    // key
    const key = `like:${[from.toLowerCase(), to.toLowerCase()].sort().join(':')}`;

    // find by ref
    return (await LikeModel.findByRef(`like:${key}`, ...args))[0];
  }
  
  /**
   * find contexts by account
   *
   * @param from 
   */
  static findLikes(from, ...args) {
    // find by ref
    return LikeModel.findByRef(`likes:${from}`, ...args);
  }
  
  /**
   * find contexts by account
   *
   * @param to 
   */
  static findLiked(to, ...args) {
    // find by ref
    return LikeModel.findByRef(`liked:${to}`, ...args);
  }
}