
// import nft controller
import ethUtil from 'ethereumjs-util';
import { generateNonce, SiweMessage } from 'siwe';

// import local
import NFTController, { Route } from '../base/controller';
import UserModel from '../models/user';
import CacheModel from '../models/cache';
import FeedUitlity from '../utilities/feed';
import SessionModel from '../models/session';

/**
 * create auth controller
 */
export default class AuthController extends NFTController {

  /**
   * listen for user
   *
   * @param socket 
   * @param post 
   */
  myUserListener(socket, user) {
    // send post to socket
    socket.emit('user', user);
  }

  /**
   * login route
   */
  @Route('GET', '/api/v1/auth/:address')
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
    if (alreadyAuthenticated && alreadyAuthenticated.get('account')) {
      // create feed
      FeedUitlity.account(alreadyAuthenticated.get('account'));

      // set to socket
      req.account = alreadyAuthenticated.get('account');

      // create user
      const user = await UserModel.findById(req.account.toLowerCase()) || new UserModel({
        id      : req.account.toLowerCase(),
        account : req.account.toLowerCase(),
      });

      // subscribe
      this.base.emit('authenticated', req);
      req.subscribe(`user:${address}`.toLowerCase(), this.myUserListener);

      // already authed
      return {
        result  : await user.toJSON(),
        success : true,
      };
    }
    
    // nonce
    const nonce = generateNonce();
    
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
  @Route('POST', '/api/v1/auth/:address')
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
    const user = await UserModel.findById(fields.address.toLowerCase()) || new UserModel({
      id      : fields.address.toLowerCase(),
      account : fields.address,
    });

    // save
    user.save();

    // create feed
    FeedUitlity.account(fields.address.toLowerCase());

    // set to socket
    req.account = fields.address.toLowerCase();
    
    // set to cache
    const session = await SessionModel.findById(req.ssid) || new SessionModel({
      id : req.ssid,
    });

    // set
    session.set('refs', [`account:${address.toLowerCase()}`]);
    session.set('account', req.account);
    
    // save
    await session.save();

    // subscribe
    this.base.emit('authenticated', req);
    req.subscribe(`user:${address}`.toLowerCase(), this.myUserListener);

    // success
    return {
      result  : await user.toJSON(),
      success : true,
    };
  }
}