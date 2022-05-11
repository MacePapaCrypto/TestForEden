
// import fetch
import fetch from 'node-fetch';
import getUrls from 'get-urls';
import UserModel from '../models/user';
import TransferModel from '../models/transfer';
import CollectionModel from '../models/collection';

// embed utility
class EmbedUtility {

  /**
   * parses post model
   *
   * @param postModel 
   */
  async post(postModel, opts) {
    // get content
    const urls = Array.from(getUrls(postModel.get('content') || ''));

    // parse addresses
    const ethAddresses = Array.from((postModel.get('content') || '').matchAll(/0x[a-fA-F0-9]{40}/g)).map(([address]) => address);

    // embeds
    const parsedRefs = [];
    const parsedLinks = [];
    const parsedEmbeds = [];

    // loop
    [
      ...((await Promise.all(urls.map((url) => this.parseURL(url, opts)))).filter((t) => t)),
      ...((await Promise.all(ethAddresses.map((addr) => this.parseADD(addr, opts)))).filter((t) => t)),
    ].map(({ embed, link, ref }) => {
      // if embed
      if (ref) parsedRefs.push(ref);
      if (link) parsedLinks.push(link);
      if (embed) parsedEmbeds.push(embed);
    });

    // set embeds
    postModel.set('refs', Array.from(new Set([...(postModel.get('refs') || []), ...parsedRefs])));
    postModel.set('links', parsedLinks);
    postModel.set('embeds', parsedEmbeds);
    await postModel.save();
  }
  
  /**
   * parse url
   *
   * @param url 
   * @param opts 
   */
  async parseURL(url, opts = {}) {
    // load from embed.rocks
    const res = await fetch(`https://api.embed.rocks/api?url=${encodeURIComponent(url)}&autoplay=1`, {
      headers : {
        'x-api-key' : '14c9a074-bde3-406c-879f-e68877021ab1',
      },
    });
    const data = await res.json();

    // author
    data.author = data.oembed ? {
      url  : data.oembed.author_url,
      name : data.oembed.author_name,
    } : null;
    data.provider = {
      url  : data.oembed ? data.oembed.provider_url : url,
      name : data.oembed ? data.oembed.provider_name : data.site,
    };

    // delete unwanted
    delete data.html;
    delete data.site;
    delete data.oembed;

    // return data
    return {
      embed : data,
    };
  }
  
  /**
   * parse url
   *
   * @param url 
   * @param opts 
   */
  async parseADD(address, opts = {}) {
    // find possible addresses
    const [
      account,
      transfers,
      collection,
    ] = await Promise.all([
      UserModel.findById(address),
      TransferModel.findByHash(address),
      CollectionModel.findById(address),
    ]);

    // check if collection
    if (collection) {
      // return collection
      return {
        // embed
        embed : {
          ...(await collection.toJSON()),
  
          type : 'collection',
        },
        
        // reference
        ref : `collection:${collection.get('id')}`,

        // link
        link : {
          to   : `/collection/${collection.get('id')}`,
          ref  : `collection:${collection.get('id')}`,
          type : 'collection',
          name : collection.get('name'),
        },
      };
    } else if (transfers.length) {
      return {
        
        
        type : 'transfer',
      };
    }
  }
}

// export defualt
export default new EmbedUtility();