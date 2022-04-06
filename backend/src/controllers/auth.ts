
// import nft controller
import ethUtil from 'ethereumjs-util';
import NodeCache from 'node-cache';
import { generateNonce, SiweMessage } from 'siwe';

// import local
import NFTController, { Route } from '../base/controller';

// create local cache
const cache = new NodeCache({
  stdTTL : 600,
});

/**
 * create auth controller
 */
export default class AuthController extends NFTController {
  // set banner
  private __banner: string = '*** WARNING *** Ask the site to change the default banner *** WARNING ***';

  /**
   * login route
   */
  @Route('GET', '/auth/:address')
  async authAction(req, { data, params }, next) {
    // return json
    const { address } = params;

    // check valid
    if (!ethUtil.isValidAddress(address)) return {
      success : false,
      message : 'Please use valid address',
    };

    // check cache for session
    // @todo cache should be redis
    const alreadyAuthenticated = cache.get(req.ssid);

    // check authenticated
    if (alreadyAuthenticated) {
      // already authed
      return {
        result : {
          account : alreadyAuthenticated,
        },
        success : true,
      };
    }
    
    // nonce
    const nonce = generateNonce();
    
    // set to cache
    cache.set(address.toLowerCase(), nonce);

    // return
    return {
      result  : {
        nonce,
      },
      success : true,
    }
  }

  /**
   * authenticate action
   *
   * @param address 
   * @returns 
   */
  @Route('POST', '/auth/:address')
  async authCompleteAction(req, { data, params }, next) {
    // get message/signature
    const { address } = params;
    const { message, signature } = data;

    // check
    if (!message || !signature) {
      // failed
      return {
        success : false,
        message : 'Failed to authenticate',
      };
    }

    // actual message
    const actualMessage = new SiweMessage(message);

    // fields
    const fields = await actualMessage.validate(signature);

    // failed nonce check
    if (fields.nonce !== cache.get(address.toLowerCase())) {
      // failed
      return {
        success : false,
        message : 'Failed to authenticate',
      };
    }

    // set to socket
    req.account = fields.address;

    // set to cache for later
    // @todo cache should be redis
    cache.set(req.ssid, req.account);

    // success
    return {
      result  : true,
      success : true,
    };
  }
}