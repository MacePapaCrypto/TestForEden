
// import nft controller
import NFTController, { Route } from '../base/controller';

/**
 * create auth controller
 */
export default class AuthController extends NFTController {

  /**
   * login route
   */
  @Route('POST', '/login')
  async loginAction(req, { data }, next) {
    // return result
    return data;
  }
}