
// import local
import NftModel from '../models/nft';
import UserModel from '../models/user';
import NFTController, { Route } from '../base/controller';

/**
 * create auth controller
 */
export default class PostController extends NFTController {

  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('GET', '/account/:id')
  async getAction(req, { data, params }, next) {
    // get post
    const user = await UserModel.findById(`${params.id}`.toLowerCase());

    // return post
    return {
      result : user ? await user.toJSON() : {
        id : params.id,
      },
      success : true,
    };
  }

  /**
   * post get endpoint
   * 
   * @returns
   */
  @Route('POST', '/account/update')
  async updateAction(req, { data, params }, next) {
    // check account
    if (!req.account) return {
      success : false,
      message : 'Authentication Required',
    };

    // get post
    const user = await UserModel.findById(`${req.account}`.toLowerCase()) || new UserModel({
      id      : `${req.account}`.toLowerCase(),
      account : `${req.account}`,
    });

    // updated
    let updated = false;

    // set info
    if (data.avatar) {
      // load avatar nft
      const avatar = await NftModel.findById(data.avatar);

      // check avatar
      if (avatar) {
        // set avatar
        user.set('avatar', avatar.get('id'));

        // updated
        updated = true;
      }
    }

    // if updated
    if (updated) await user.save();

    // return post
    return {
      result : user ? await user.toJSON() : {
        id : params.id,
      },
      success : true,
    };
  }
}