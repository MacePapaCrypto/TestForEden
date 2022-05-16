
import Model, { Type } from '../base/model';
import NFTModel from './nft';

/**
 * export model
 */
@Type('user')
export default class UserModel extends Model {

  /**
   * to json
   *
   * @param cache 
   * @param small 
   * @returns 
   */
  async toJSON(cache = {}, small = false) {
    // load super
    const sanitised = await super.toJSON();

    // check avatar
    if (this.get('avatar')) {
      // load avatar
      if (!cache[this.get('avatar')]) cache[this.get('avatar')] = (async () => {
        // load avatar
        const avatarNFT = await NFTModel.findById(this.get('avatar'));
        
        // check nft
        if (avatarNFT) return avatarNFT.toJSON(cache);
      })();

      // load
      const actualAvatar = await cache[this.get('avatar')];

      // check avatar
      if (actualAvatar) {
        // set avatar
        sanitised.avatar = actualAvatar;
      }
    }

    // return sanitised
    return sanitised;
  }
}