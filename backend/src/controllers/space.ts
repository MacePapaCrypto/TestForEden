

// import local
import NFTController, { Route } from '../base/controller';
import RoleModel from '../models/role';
import SpaceModel from '../models/space';
import MemberModel from '../models/member';

/**
 * create auth controller
 */
export default class SpaceController extends NFTController {

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/space')
  async listAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // get parent
    const parent = data.space;

    // segment cache
    let sanitised = [];
    const segmentCache = {};

    // check parent
    if (parent) {
      // find subspaces
      const subSpaces = await SpaceModel.findBySpace(parent);

      // sanitise spaces
      sanitised = (await Promise.all(subSpaces.map((space) => space.toJSON(segmentCache)))).filter((s) => s);
    } else {
      // load segments
      const members = await MemberModel.findByAccount(lowerAccount);

      // sanitised
      sanitised = (await Promise.all(members.map(async (member) => {
        // get segment
        const memberSpace = await member.getSpace();

        // sanitise
        return memberSpace ? await memberSpace.toJSON(segmentCache, member) : null;
      }))).filter((s) => s);
    }

    // return
    return {
      result  : sanitised,
      success : true,
    };
  }

  /**
   * space get endpoint
   * 
   * @returns
   */
  @Route('GET', '/space/:id')
  async getAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // get segment
    const space = await SpaceModel.findById(params.id);

    // return segment
    return {
      result  : space ? await space.toJSON({}, lowerAccount) : null,
      success : !!space,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('POST', '/space')
  async createAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // get actual nft
    const nfts = (data.nfts || []).map((nft) => {
      // check nft
      if (typeof nft === 'string') return nft;
      if (typeof nft?.id === 'string') return nft.id;
      return null;
    }).filter((nft) => nft);

    // check image
    let image = data.image?.id || data.image;
    if (typeof image !== 'string') image = null;

    // privacy
    const privacy = ['public', 'private', 'nft'].includes(data.privacy) ? data.privacy : 'private';
    
    // create default segment
    const newSpace = new SpaceModel({
      nfts,
      refs : [
        `privacy:${privacy}`,
        `account:${lowerAccount}`,
        
        ...(image ? [`image:${image}`] : []),
        ...(nfts.map((nft) => `owns:${nft}`)),
      ],

      count : {
        members : 1,
      },

      image,
      privacy,
      
      name : data.name,
      description : data.description,

      source  : 'create',
      account : lowerAccount,
    });
    const newRole = new RoleModel({
      name : 'Owner',
      acls : ['*'],

      refs    : [
        `space:${newSpace.id}`
      ],
      color   : '#fdc07b',
      account : lowerAccount,
      segment : newSpace.id,
    });
    const newMember = new MemberModel({
      refs    : [
        `role:${newRole.id}`,
        `space:${newSpace.id}`,
        `account:${lowerAccount}`,
        `account:${lowerAccount}:${newSpace.id}`,
      ],
      roles   : [newRole.id],
      space   : newSpace.id,
      account : lowerAccount,
      
      value : {
        order  : data.order,
        parent : data.parent,
      },
    });

    // save
    await Promise.all([
      newRole.save(null, true),
      newSpace.save(null, true),
      newMember.save(null, true),
    ]);

    // sanitised
    const sanitisedSpace = await newSpace.toJSON({}, newMember);

    // return
    return {
      result  : sanitisedSpace,
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('PATCH', '/space/:id')
  async updateAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // load actual segment
    const updateSpace = await SpaceModel.findById(params.id);

    // get member
    const updateMember = await updateSpace.getMember(lowerAccount);

    // check account
    // @todo proper acl
    if (!updateMember) return {
      success : false,
      message : 'Permission Denied',
    };

    // save space
    let saveSpace = false;

    // actual updates
    if (updateSpace.get('account') === lowerAccount) {
      // save space
      saveSpace = true;

      // get actual nft
      const nfts = (data.nfts || []).map((nft) => {
        // check nft
        if (typeof nft === 'string') return nft;
        if (typeof nft?.id === 'string') return nft.id;
        return null;
      }).filter((nft) => nft);

      // check image
      let image = data.image?.id || data.image;
      if (typeof image !== 'string') image = null;

      // privacy
      const privacy = ['public', 'private', 'nft'].includes(data.privacy) ? data.privacy : 'private';

      // set
      if (typeof data.nfts !== 'undefined') updateSpace.set('nfts', nfts);
      if (typeof data.name !== 'undefined') updateSpace.set('name', data.name);
      if (typeof data.image !== 'undefined') updateSpace.set('image', image);
      if (typeof data.privacy !== 'undefined') updateSpace.set('privacy', privacy);
      if (typeof data.description !== 'undefined') updateSpace.set('description', data.description);
    }

    // update member
    if (typeof data.open !== 'undefined') updateMember.set('value.open', data.open);
    if (typeof data.order !== 'undefined') updateMember.set('value.order', data.order);
    if (typeof data.parent !== 'undefined') updateMember.set('value.parent', data.parent);

    // save
    await Promise.all([
      updateMember.save(),
      saveSpace ? updateSpace.save() : null,
    ]);

    // sanitised
    const sanitisedSpace = await updateSpace.toJSON({}, updateMember);

    // return
    return {
      result  : sanitisedSpace,
      success : true,
    };
  }

  /**
   * sidebar endpoint
   * 
   * @returns
   */
  @Route('POST', '/space/sidebar')
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

    // get spaces
    const members = await MemberModel.findByAccount(lowerAccount);

    // cache
    const sanitiseCache = {};

    // loop spaces
    await Promise.all(data.spaces.map(async (subData) => {
      // find segment
      const memberSpace = members.find((m) => m.get('space') === subData.id);

      // check segment
      if (!memberSpace) return;

      // set
      if (typeof subData.open !== 'undefined') memberSpace.set('value.open', subData.open);
      if (typeof subData.order !== 'undefined') memberSpace.set('value.order', subData.order);
      if (typeof subData.parent !== 'undefined') memberSpace.set('value.parent', subData.parent);

      // save
      await memberSpace.save();

      // get real segment
      const realSpace = await memberSpace.getSpace();

      // sanitised
      const sanitisedSpace = await realSpace.toJSON(sanitiseCache, memberSpace);

      // replace
      result = result.filter((s) => s.id !== sanitisedSpace.id);

      // push segment
      result.push(sanitisedSpace);
    }));

    // return
    return {
      result,
      success : true,
    };
  }
}