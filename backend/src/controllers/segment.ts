
// import local
import NFTController, { Route } from '../base/controller';
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
    const sessionSegments = await SegmentModel.findBySession(req.ssid);
    const accountSegments = lowerAccount ? await SegmentModel.findByAccount(lowerAccount) : [];

    // actual segments
    const actualSegments = [...accountSegments, ...sessionSegments].reduce((accum, segment) => {
      // check exists
      if (accum.find((s) => `${s.get('id')}` === `${segment.get('id')}`)) return accum;
      if (accum.find((s) => s.get('source') === 'default')) return accum;

      // push segment
      accum.push(segment);

      // return
      return accum;
    }, []);

    // update all
    actualSegments.forEach((segment) => {
      // update to mine only
      if (!segment.get('account') && lowerAccount) {
        segment.set('refs', Array.from(new Set([...segment.get('refs'), `account:${lowerAccount}`])));
        segment.set('account', lowerAccount);
        segment.save();
      }
    });

    // return
    return {
      result  : await Promise.all(actualSegments.map((segment) => segment.toJSON())),
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
    // get segment
    const segment = await SegmentModel.findById(params.id);

    // return segment
    return {
      result  : segment ? await segment.toJSON() : null,
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
      name  : data.name,
      type  : data.type || 'segment',
      refs  : [`session:${req.ssid}`, `account:${lowerAccount}`],
      order : data.order || 0,

      ssid    : req.ssid,
      source  : 'create',
      account : lowerAccount,
    });

    // save
    await createdSegment.save();

    // sanitised
    const sanitisedSegment = await createdSegment.toJSON();

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
    if (typeof data.open !== 'undefined') updatingSegment.set('open', data.open);
    if (typeof data.order !== 'undefined') updatingSegment.set('order', data.order);
    if (typeof data.parent !== 'undefined') updatingSegment.set('parent', data.parent);

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
  @Route('POST', '/segment/updates')
  async updatesAction(req, { data, params }, next) {
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

    // loop segments
    await Promise.all(data.segments.map(async (subData) => {
      // find segment
      const segment = result.find((s) => s.id === subData.id);

      // check segment
      if (!segment) return;

      // load actual segment
      const updatingSegment = await SegmentModel.findById(subData.id);

      // check account
      if (updatingSegment.get('account') !== lowerAccount) return;

      // set
      if (typeof subData.name !== 'undefined') updatingSegment.set('name', subData.name);
      if (typeof subData.open !== 'undefined') updatingSegment.set('open', subData.open);
      if (typeof subData.order !== 'undefined') updatingSegment.set('order', subData.order);
      if (typeof subData.parent !== 'undefined') updatingSegment.set('parent', subData.parent);

      // save
      await updatingSegment.save();

      // sanitised
      const sanitisedSegment = await updatingSegment.toJSON();

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