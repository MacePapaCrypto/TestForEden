

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
  @Route('GET', '/s/:id')
  async spaceAction(req, { data, params }, next) {
    // load space
    const actualSpace = await SpaceModel.findById(params.id);
    const actualImage = await actualSpace.getImage();

    // let meta
    const meta = [];
    
    // push
    meta.push(`<meta property="og:type" content="website" />`);
    meta.push(`<meta property="og:site_name" content="Moon Social" />`);
    meta.push(`<meta name="description" content=${JSON.stringify(actualSpace.get('description') || '')} />`);
    meta.push(`<meta property="og:title" content=${JSON.stringify(actualSpace.get('name') || '')} />`);
    meta.push(`<meta name="twitter:card" content="summary_large_image" />`);
    meta.push(`<meta name="twitter:title" content=${JSON.stringify(actualSpace.get('name') || '')} />`);
    meta.push(`<meta name="twitter:description" content=${JSON.stringify(actualSpace.get('description') || '')} />`);
    meta.push(`<meta name="og:description" content=${JSON.stringify(actualSpace.get('description') || '')} />`);

    // image
    if (actualImage) {
      // image url
      const imageURL = `https://media.dashup.com/${actualImage.get('contract')}-${actualImage.get('tokenId')}?w=600&h=600`;

      // push url
      meta.push(`<meta property="og:image" content=${JSON.stringify(imageURL)} />`);
      meta.push(`<meta property="og:image:width" content="600" />`);
      meta.push(`<meta property="og:image:height" content="600" />`);
      meta.push(`<meta property="og:image:secure_url" content=${JSON.stringify(imageURL)} />`);
      meta.push(`<meta property="og:image:alt" content=${JSON.stringify(actualImage.get('value.name') || '')} />`);
      meta.push(`<meta name="twitter:image" content=${JSON.stringify(imageURL)} />`)
    }

    // return html
    return this.base.html({
      meta  : meta.join(''),
      title : actualSpace.get('name'),
    });
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/space/list')
  async listAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = data.account ? `${data.account}`.toLowerCase() : (req.account ? `${req.account}`.toLowerCase() : null);

    // feed
    const feed = ['account', 'latest', 'mooning'].find((l) => l === (data.feed || 'account'));

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
      sanitised = [
        ...((await Promise.all(subSpaces.map((space) => space.toJSON(segmentCache)))).filter((s) => s)),
      ];
    } else if (feed === 'account') {
      // check account
      if (!lowerAccount) return {
        success : false,
        message : 'Account required',
      };

      // load segments
      const members = await MemberModel.findByAccount(lowerAccount);

      // sanitised
      sanitised = [
        ...(await Promise.all(members.map(async (member) => {
          // get segment
          const memberSpace = await member.getSpace();
  
          // sanitise
          return memberSpace ? await memberSpace.toJSON(segmentCache, member) : null;
        }))),
      ].filter((s) => s).sort((a, b) => {
        // order
        const aO = a.order || 0;
        const bO = b.order || 0;
    
        // return
        if (aO < bO) return -1;
        if (aO > bO) return 1;
        return 0;
      }).map((item, order) => {
        // set order
        item.order = typeof item.order === 'undefined' ? order : item.order;
        return item;
      });
    } else if (feed === 'mooning') {
      // mooning groups
      const spaces = await SpaceModel.findByRef('root:public', (data.limit || 25), 'rank.score');

      // promise all
      sanitised = await Promise.all(spaces.map((g) => g.toJSON(segmentCache, req.account)));
    } else if (feed === 'latest') {
      // mooning groups
      const spaces = await SpaceModel.findByRef('root:public', (data.limit || 25), 'createdAt');

      // promise all
      sanitised = await Promise.all(spaces.map((g) => g.toJSON(segmentCache, req.account)));
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
  @Route('GET', '/api/v1/space/:id')
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
  @Route('POST', '/api/v1/space')
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

    // parent space
    let parentSpace;

    // parent space
    if (data.space) {
      // get parent
      parentSpace = await SpaceModel.findById(data.space);

      // check parent
      if (!parentSpace) return;
    }

    // privacy
    const feed = ['feed', 'chat', 'gallery'].includes(data.feed) ? data.feed : 'feed';
    const privacy = ['public', 'private', 'nft'].includes(data.privacy) ? data.privacy : 'private';
    
    // create default segment
    const newSpace = new SpaceModel({
      nfts,
      refs : [
        `privacy:${privacy}`,
        `account:${lowerAccount}`,
        
        ...(image ? [`image:${image}`] : []),
        ...(nfts.map((nft) => `owns:${nft}`)),
        ...(parentSpace ? [`space:${parentSpace.get('id')}`] : [`root:${privacy}`]),
      ],

      count : {
        members : parentSpace ? 0 : 1,
      },

      feed,
      image,
      privacy,
      
      name        : data.name,
      order       : data.order || 0,
      space       : parentSpace?.get('id'),
      description : data.description,

      source  : 'create',
      account : lowerAccount,
    });

    // role
    let newRole, newMember;

    // check parent space
    if (!parentSpace) {
      newRole = new RoleModel({
        name : 'Owner',
        acls : ['*'],

        refs    : [
          `space:${newSpace.id}`
        ],
        color   : '#fdc07b',
        account : lowerAccount,
        segment : newSpace.id,
      });
      newMember = new MemberModel({
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
    }

    // save
    await Promise.all([
      newSpace.save(null, true),
      !parentSpace && newRole.save(null, true),
      !parentSpace && newMember.save(null, true),
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
  @Route('PATCH', '/api/v1/space/:id')
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
  @Route('POST', '/api/v1/space/sidebar')
  async updatesAction(req, { data, params }, next) {
    // lowerAccount
    const lowerAccount = req.account ? `${req.account}`.toLowerCase() : null;

    // check account
    if (!lowerAccount) return {
      result  : 'Account Required',
      success : false,
    };

    // all spaces
    let allSpaces = [];

    // check parent
    if (data.space) {
      // find subspaces
      allSpaces = [
        ...(await SpaceModel.findBySpace(data.space)),
      ];
    } else {
      allSpaces = [
        ...(await MemberModel.findByAccount(lowerAccount)),
      ];
    }

    // cache
    const result = [];
    const sanitiseCache = {};

    // loop spaces
    await Promise.all(data.spaces.map(async (subData) => {
      // find segment
      const foundSpace = allSpaces.find((s) => s.get('id') === subData.id);

      // check segment
      if (!foundSpace) return;

      // sanitised space
      let sanitisedSpace = null;

      // set values
      if (typeof subData.order !== 'undefined') foundSpace.set('value.order', subData.order);
      if (typeof subData.parent !== 'undefined') foundSpace.set('value.parent', subData.parent);

      // save
      await foundSpace.save();

      // get real segment
      const realSpace = await foundSpace.getSpace();

      // sanitised
      sanitisedSpace = await realSpace.toJSON(sanitiseCache, foundSpace);

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