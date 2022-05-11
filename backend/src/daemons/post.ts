
// import local
import PostModel from '../models/post';
import embedUtility from '../utilities/embed';
import NFTDaemon, { Action } from '../base/daemon';

/**
 * create auth controller
 */
export default class PostDaemon extends NFTDaemon {

  /**
   * 
   */
  @Action('rank.score', 10000, 'poll', (60 * 1000))
  async rankScoreAction() {
    // log do
    const hottestPublic = await PostModel.findByRef('public', 1000, 'rank.score', 'desc');

    // log
    hottestPublic.forEach((publicPost) => {
      // save to update rank
      publicPost.save();
    });
  }
}