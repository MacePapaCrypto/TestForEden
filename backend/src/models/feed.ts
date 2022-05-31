
import mquery from 'mquery';
import PostModel from './post';
import Model, { Type } from '../base/model';

/**
 * export model
 */
@Type('feed')
export default class FeedModel extends Model {

  /**
   * adds post to feed
   *
   * @param post 
   */
  public async addPost(post, sorts = ['createdAt']) {
    // return posts
    let q = mquery(FeedModel.database.collection('feedPosts'));
    
    // save model
    await q.findOneAndUpdate({
      id   : post.get('id'),
      feed : this.get('id'),
    }, {
      id   : post.get('id'),
      feed : this.get('id'),

      ...(sorts.reduce((accum, sort) => {
        // add sort
        accum[sort] = post.get(sort);

        // return accum
        return accum;
      }, {}))
    }, {
      upsert : true,
    });
  }

  /**
   * find by id
   *
   * @param id
   */
  async findPosts(limit: number = 25, sort: string = 'createdAt', direction: 'asc' | 'desc' = 'desc', page: number | null = 0): Promise<Array<any>> {
    // return posts
    let q = mquery(FeedModel.database.collection('feedPosts'));

    // if sort
    if (sort) {
      // sort
      q = q.sort({
        [sort] : direction === 'desc' ? -1 : 1,
      });
    }

    // limit
    q = q.limit(limit);

    // if page
    if (page) {
      // skip
      q = q.skip(page * limit);
    }

    // return find by ids
    const many = await q.find();

    // return find by ids
    return await PostModel.findByIds(many.map((item) => item.id));
  }

  /**
   * find feed by account
   *
   * @param account 
   */
  static async findByAccount(account) {
    // find
    return FeedModel.findById(`account:${account}`);
  }
}