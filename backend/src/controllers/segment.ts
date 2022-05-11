
// import local
import NFTController, { Route } from '../base/controller';
import MemberModel from '../models/member';
import RoleModel from '../models/role';
import SegmentModel from '../models/segment';

/**
 * create auth controller
 */
export default class SegmentController extends NFTController {

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/segment')
  async listAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // load segments
    const members = await MemberModel.findByAccount(lowerAccount);

    // segment cache
    const segmentCache = {};

    // return
    return {
      result : (await Promise.all(members.map(async (member) => {
        // get segment
        const memberSegment = await member.getSegment();

        // sanitise
        return memberSegment ? await memberSegment.toJSON(segmentCache, member) : null;
      }))).filter((s) => s),
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/segment/:id')
  async getAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // get segment
    const segment = await SegmentModel.findById(params.id);

    // return segment
    return {
      result  : segment ? await segment.toJSON({}, lowerAccount) : null,
      success : !!segment,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('POST', '/segment')
  async createAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // get segments
    const { success, message, result } = await this.listAction(req, { data : {}, params : {} }, next);

    // failed
    if (!success) return {
      success,
      message,
    };
    
    // create default segment
    const createdSegment = new SegmentModel({
      name : data.name,
      refs : [`session:${req.ssid}`, `account:${lowerAccount}`],

      ssid    : req.ssid,
      source  : 'create',
      privacy : 'public',
      account : lowerAccount,
    });
    const createdRole = new RoleModel({
      name : 'Owner',
      acls : ['*'],

      refs    : [`segment:${createdSegment.id}`],
      color   : '#fdc07b',
      account : lowerAccount,
      segment : createdSegment.id,
    });
    const createdMember = new MemberModel({
      refs    : [`account:${lowerAccount}`, `account:${lowerAccount}:${createdSegment.id}`, `segment:${createdSegment.id}`, `role:${createdRole.id}`],
      roles   : [createdRole.id],
      account : lowerAccount,
      segment : createdSegment.id,
    });

    // save
    await Promise.all([
      createdRole.save(),
      createdMember.save(),
      createdSegment.save(),
    ]);

    // sanitised
    const sanitisedSegment = await createdSegment.toJSON({}, createdMember);

    // push segment
    result.push(sanitisedSegment);

    // return
    return {
      result  : {
        created  : sanitisedSegment,
        segments : result,
      },
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('PATCH', '/segment/:id')
  async updateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // get segments
    let { success, message, result } = await this.listAction(req, { data : {}, params : {} }, next);

    // failed
    if (!success) return {
      success,
      message,
    };

    // find segment
    const segment = result.find((s) => s.id === params.id);

    // check segment
    if (!segment) return {
      success : false,
      message : 'Segment not found',
    };

    // load actual segment
    const updatingSegment = await SegmentModel.findById(params.id);

    // check account
    if (updatingSegment.get('account') !== lowerAccount) return {
      success : false,
      message : 'Permission Denied',
    };

    // set
    if (typeof data.name !== 'undefined') updatingSegment.set('name', data.name);

    // save
    await updatingSegment.save();

    // sanitised
    const sanitisedSegment = await updatingSegment.toJSON();

    // replace
    result = result.filter((s) => s.id !== sanitisedSegment.id);

    // push segment
    result.push(sanitisedSegment);

    // return
    return {
      result  : {
        updated  : sanitisedSegment,
        segments : result,
      },
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('POST', '/segment/sidebar')
  async updatesAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // get result
    let { success, message, result } = await this.listAction(req, { data : {}, params : {} }, next);

    // failed
    if (!success) return {
      success,
      message,
    };

    // get segments
    const members = await MemberModel.findByAccount(lowerAccount);

    // cache
    const sanitiseCache = {};

    // loop segments
    await Promise.all(data.segments.map(async (subData) => {
      // find segment
      const memberSegment = members.find((m) => m.get('segment') === subData.id);

      // check segment
      if (!memberSegment) return;

      // set
      if (typeof subData.open !== 'undefined') memberSegment.set('value.open', subData.open);
      if (typeof subData.order !== 'undefined') memberSegment.set('value.order', subData.order);
      if (typeof subData.parent !== 'undefined') memberSegment.set('value.parent', subData.parent);

      // save
      await memberSegment.save();

      // get real segment
      const realSegment = await memberSegment.getSegment();

      // sanitised
      const sanitisedSegment = await realSegment.toJSON(sanitiseCache, memberSegment);

      // replace
      result = result.filter((s) => s.id !== sanitisedSegment.id);

      // push segment
      result.push(sanitisedSegment);
    }));

    // return
    return {
      result,
      success : true,
    };
  }
}