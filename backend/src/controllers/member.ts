
// import local
import NFTController, { Route } from '../base/controller';
import SpaceModel from '../models/space';
import MemberModel from '../models/member';

/**
 * create auth controller
 */
export default class MemberController extends NFTController {

  /**
   * constructor
   *
   * @param args 
   */
  constructor(...args) {
    // run super
    super(...args);

    // on data
    this.base.on('authenticated', (req) => {
      // check account
      if (!req.account) return;

      // add member listener
      req.subscribe(`member+account:${req.account.toLowerCase()}`, this.memberListener);
      req.subscribe(`delete+member+account:${req.account.toLowerCase()}`, this.memberDeleteListener);
    });
  }

  /**
   * listen for post
   *
   * @param socket 
   * @param post 
   */
  async memberListener(socket, member) {
    // get post
    const actualMember = await MemberModel.findById(member.id);
    const actualSpace = await actualMember.getSpace();

    // send post to socket
    socket.emit('space', await actualSpace.toJSON({}, actualMember));
  }

  /**
   * listen for post
   *
   * @param socket 
   * @param post 
   */
  async memberDeleteListener(socket, member) {
    // get space
    const actualSpace = await SpaceModel.findById(member.space);

    // send post to socket
    socket.emit('space+remove', await actualSpace.toJSON({}, null, true));
  }

  /**
   * login route
   */
  @Route('GET', '/api/v1/member/:subject')
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
    const existingMember = await MemberModel.findByAccountSpace(lowerAccount, subject);

    // return
    return {
      result  : existingMember ? await existingMember.toJSON() : false,
      success : true,
    }
  }

  /**
   * login route
   */
  @Route('POST', '/api/v1/member/:subject')
  async createAction(req, { data, params }, next) {
    // return json
    const { subject } = params;

    // lower account
    const lowerAccount = req.account?.toLowerCase();

    // check account
    if (!req.account) return {
      success : false,
      message : 'Authentication Required',
    };

    // load space
    const actualSpace = await SpaceModel.findById(subject.toLowerCase());

    // check account
    if (!actualSpace) return {
      success : false,
      message : 'Space Not Found',
    };

    // add member
    const [newMember, newCount] = await MemberModel.addMember(lowerAccount, subject);

    // return
    return {
      result : {
        count  : newCount,
        member : newMember ? await newMember.toJSON() : false,
      },
      success : true,
    }
  }

  /**
   * login route
   */
  @Route('DELETE', '/api/v1/member/:subject')
  async removeAction(req, { data, params }, next) {
    // return json
    const { subject } = params;

    // lower account
    const lowerAccount = req.account?.toLowerCase();

    // check account
    if (!req.account) return {
      success : false,
      message : 'Authentication Required',
    };

    // load space
    const actualSpace = await SpaceModel.findById(subject.toLowerCase());

    // check account
    if (!req.account) return {
      success : false,
      message : 'Space Not Found',
    };

    // get member
    const actualMember = await actualSpace.getMember(lowerAccount);
    
    // count
    const [,newCount] = await actualMember.remove();

    // return
    return {
      result : {
        count  : newCount,
        member : actualMember ? await actualMember.toJSON() : null,
      },
      success : true,
    }
  }
}