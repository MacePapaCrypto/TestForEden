
// import nft controller
import ethUtil from 'ethereumjs-util';
import { generateNonce, SiweMessage } from 'siwe';

// import local
import NFTController, { Route } from '../base/controller';
import UserModel from '../models/user';
import CacheModel from '../models/cache';
import SessionModel from '../models/session';

/**
 * create auth controller
 */
export default class AuthController extends NFTController {

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
    const alreadyAuthenticated = await SessionModel.findById(req.ssid);

    // check authenticated
    if (alreadyAuthenticated) {
      // set to socket
      req.account = alreadyAuthenticated.get('account');

      // already authed
      return {
        result : {
          account : alreadyAuthenticated.get('account'),
        },
        success : true,
      };
    }
    
    // nonce
    const nonce = generateNonce();

    console.log('test', nonce);
    
    // set to cache
    const cached = new CacheModel({
      refs  : [`auth:${address.toLowerCase()}`],
      value : nonce,
    });

    // save
    await cached.save();

    // return
    return {
      result : {
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

    // get cached
    const cached = await CacheModel.findByRef(`auth:${address.toLowerCase()}`);
    const found = cached.find((c) => c.get('value') === fields.nonce);

    // failed nonce check
    if (!found) {
      // failed
      return {
        success : false,
        message : 'Failed to authenticate',
      };
    }

    // delete
    found.remove();

    // create user
    const user = await UserModel.findById(fields.address) || new UserModel({
      id : fields.address,
    });

    // save
    user.save();

    // set to socket
    req.account = fields.address;
    
    // set to cache
    const session = new SessionModel({
      id      : req.ssid,
      refs    : [`account:${address.toLowerCase()}`],
      account : req.account,
    });
    
    // save
    await session.save();

    // success
    return {
      result  : true,
      success : true,
    };
  }
}