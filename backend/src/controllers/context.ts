
// import local
import NFTController, { Route } from '../base/controller';
import ContextModel from '../models/context';
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
  @Route('GET', '/context')
  async listAction(req, { data, params }, next) {
    // check segment
    const segment = (data.s || data.segment) ? (data.s || data.segment).toLowerCase() : null;
    const account = (data.a || data.account) ? (data.a || data.account).toLowerCase() : null;

    // contexts
    let actualContexts = [];

    // check section
    if (segment) {
      actualContexts = await ContextModel.findBySegment(segment);
    } else if (account) {
      actualContexts = await ContextModel.findByAccount(account);
    }

    // return
    return {
      result  : await Promise.all(actualContexts.map((context) => context.toJSON())),
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/context/:id')
  async getAction(req, { data, params }, next) {
    // get segment
    const context = await ContextModel.findById(params.id);

    // return segment
    return {
      result  : context ? await context.toJSON() : null,
      success : !!context,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('POST', '/context')
  async createAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // get segments
    const { success, message, result } = await this.listAction(req, { data, params : {} }, next);

    // failed
    if (!success) return {
      success,
      message,
    };

    // source
    const source = (data.a || data.account) ? 'profile' : 'segment';
    
    // create default segment
    const createdContext = new ContextModel({
      name  : data.name,
      feed  : data.feed || 'feed',
      refs  : [`segment:${data.s || data.segment}`.toLowerCase(), `account:${lowerAccount}`, `source:${source}`],
      order : data.order || 0,

      ssid    : req.ssid,
      source  : source,
      segment : data.s || data.segment,
      account : lowerAccount,
    });

    // save
    await createdContext.save();

    // sanitised
    const sanitisedContext = await createdContext.toJSON();

    // push segment
    result.push(sanitisedContext);

    // return
    return {
      result  : {
        created  : sanitisedContext,
        contexts : result,
      },
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('PATCH', '/context/:id')
  async updateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // get segments
    let { success, message, result } = await this.listAction(req, { data, params : {} }, next);

    // failed
    if (!success) return {
      success,
      message,
    };

    // find segment
    const context = result.find((s) => s.id === params.id);

    // check segment
    if (!context) return {
      success : false,
      message : 'Segment not found',
    };

    // load actual segment
    const updatingContext = await ContextModel.findById(params.id);

    // check account
    if (updatingContext.get('account') !== lowerAccount) return {
      success : false,
      message : 'Permission Denied',
    };

    // set
    if (typeof data.name !== 'undefined') updatingContext.set('name', data.name);
    if (typeof data.open !== 'undefined') updatingContext.set('open', data.open);
    if (typeof data.order !== 'undefined') updatingContext.set('order', data.order);
    if (typeof data.parent !== 'undefined') updatingContext.set('parent', data.parent);

    // save
    await updatingContext.save();

    // sanitised
    const sanitisedContext = await updatingContext.toJSON();

    // replace
    result = result.filter((s) => s.id !== sanitisedContext.id);

    // push segment
    result.push(sanitisedContext);

    // return
    return {
      result  : {
        updated  : sanitisedContext,
        contexts : result,
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
    let { success, message, result } = await this.listAction(req, { data, params : {} }, next);

    // failed
    if (!success) return {
      success,
      message,
    };

    // loop segments
    await Promise.all(data.contexts.map(async (subData) => {
      // find segment
      const context = result.find((s) => s.id === subData.id);

      // check segment
      if (!context) return;

      // load actual segment
      const updatingContext = await ContextModel.findById(subData.id);

      // check account
      if (updatingContext.get('account') !== lowerAccount) return;

      // set
      if (typeof subData.name !== 'undefined') updatingContext.set('name', subData.name);
      if (typeof subData.open !== 'undefined') updatingContext.set('open', subData.open);
      if (typeof subData.order !== 'undefined') updatingContext.set('order', subData.order);
      if (typeof subData.parent !== 'undefined') updatingContext.set('parent', subData.parent);

      // save
      await updatingContext.save();

      // sanitised
      const sanitisedContext = await updatingContext.toJSON();

      // replace
      result = result.filter((s) => s.id !== sanitisedContext.id);

      // push segment
      result.push(sanitisedContext);
    }));

    // return
    return {
      result,
      success : true,
    };
  }
}