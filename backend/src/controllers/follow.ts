
// import local
import NFTController, { Route } from '../base/controller';
import FollowModel from '../models/follow';

/**
 * create auth controller
 */
export default class FollowController extends NFTController {

  /**
   * login route
   */
  @Route('GET', '/follow/:subject')
  async getAction(req, { data, params }, next) {
    // return json
    const { subject } = params;

    // check account
    if (!req.account) return {
      success : false,
      message : 'Authentication Required',
    };

    // lower account
    const lowerAccount = req.account?.toLowerCase();

    // is following
    const isFollwoing = await FollowModel.isFollwoing(lowerAccount, subject);

    // return
    return {
      result  : isFollwoing ? await isFollwoing.toJSON() : false,
      success : true,
    }
  }

  /**
   * login route
   */
  @Route('POST', '/follow/:subject')
  async followAction(req, { data, params }, next) {
    // return json
    const { subject } = params;

    // check account
    if (!req.account) return {
      success : false,
      message : 'Authentication Required',
    };

    // lower account
    const lowerAccount = req.account?.toLowerCase();

    // is following
    const [newFollowing, newCount] = await FollowModel.addFollower(lowerAccount, subject, data.type);

    // return
    return {
      result : {
        count  : newCount,
        follow : newFollowing ? await newFollowing.toJSON() : false,
      },
      success : true,
    }
  }

  /**
   * login route
   */
  @Route('DELETE', '/follow/:subject')
  async unfollowAction(req, { data, params }, next) {
    // return json
    const { subject } = params;

    // check account
    if (!req.account) return {
      success : false,
      message : 'Authentication Required',
    };

    // lower account
    const lowerAccount = req.account?.toLowerCase();

    // is following
    const isFollwoing = await FollowModel.isFollwoing(lowerAccount, subject);

    // new count
    let newCount = 0;

    // check following
    if (isFollwoing) {
      // count
      const [, removeCount] = await isFollwoing.remove();
      newCount = removeCount;
    }

    // return
    return {
      result : {
        count  : newCount,
        follow : null,
      },
      success : true,
    }
  }
}