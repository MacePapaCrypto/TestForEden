
// import fetch
import fetch from 'node-fetch';
import getUrls from 'get-urls';

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

    // check urls
    if (!urls.length) return;

    // loop
    const parsedEmbeds = (await Promise.all(urls.map((url) => this.parse(url, opts)))).filter((t) => t);

    // set embeds
    postModel.set('embeds', parsedEmbeds);
    await postModel.save();
  }
  
  /**
   * parse url
   *
   * @param url 
   * @param opts 
   */
  async parse(url, opts = {}) {
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
    return data;
  }
}

// export defualt
export default new EmbedUtility();