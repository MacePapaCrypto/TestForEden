
// import local
import fetch from 'node-fetch';
import ftmUtility from '../utilities/ftmscan';
import Bottleneck from 'bottleneck';
import CollectionModel from '../models/collection';
import NFTDaemon, { Action } from '../base/daemon';

/**
 * create auth controller
 */
export default class PaintswapDaemon extends NFTDaemon {
  private __collectionBottleneck = new Bottleneck({
    maxConcurrent : 1,
  });

  /**
   * 
   */
  @Action('paintswap.list', 10000, 'poll', 30 * 60 * 1000)
  async paintswapListAction() {
    // contracts
    let allCollections = await fetch(`https://api.paintswap.finance/v2/collections?onlyMetadata=true`);
        allCollections = await allCollections.json();

    // loop collections
    allCollections.collections.forEach((collection) => this.__collectionBottleneck.schedule(async () => {
      /*
        address: "0x823b53069d388cdab190c91645a22bddafd49180"
        banner: "https://media-collections.paintswap.finance/0x823b53069d388cDaB190C91645a22BdDAFd49180_banner.jpeg"
        createdAt: "2021-11-16T21:41:53.386Z"
        customMetadata: null
        description: "\"Just random fantomboy wandering\""
        discord: "https://discord.gg/tgEVwJsN"
        displayed: true
        featured: true
        id: 184
        imageStyle: null
        isDynamicMedia: false
        isDynamicMetadata: false
        isFnft: false
        isReveal: false
        isSkipRank: false
        medium: ""
        mintPriceHigh: 0
        mintPriceLow: 0
        name: "Fantomboy"
        nsfw: false
        owner: "0x52908400098527886e0f7030069857d2e4169ee7"
        poster: "https://media-collections.paintswap.finance/0x823b53069d388cDaB190C91645a22BdDAFd49180_poster.jpeg"
        reddit: ""
        standard: "721"
        startBlock: 19593840
        telegram: ""
        thumbnail: "https://media-collections.paintswap.finance/0x823b53069d388cDaB190C91645a22BdDAFd49180_thumb.png"
        twitter: ""
        updatedAt: "2022-03-11T21:32:10.594Z"
        verified: true
        website: ""
      */

      // find in database
      const actualCollection = await CollectionModel.findById(collection.address.toLowerCase()) || new CollectionModel({
        id : collection.address.toLowerCase(),
      });

      // set data
      actualCollection.set('abi', actualCollection.get('abi') || await ftmUtility.getABI(actualCollection.get('id')));
      actualCollection.set('name', collection.name);
      actualCollection.set('account', collection.owner.toLowerCase());
      actualCollection.set('provider', 'paintswap');
      actualCollection.set('createdAt', new Date(collection.createdAt));
      actualCollection.set('description', collection.description);

      // paintswap
      actualCollection.set('meta.paintswap', {
        ...(['displayed', 'featured', 'imageStyle', 'isDynamicMedia', 'isDynamicMetadata', 'isFnft', 'isReveal', 'isSkipRank', 'medium'].reduce((accum, key) => {
          // set key
          accum[key] = collection[key];

          // return accumulator
          return accum;
        }, {}))
      });

      // links
      actualCollection.set('links', {
        ...(actualCollection.get('links') || {}),
        ...(['telegram', 'twitter', 'reddit', 'discord', 'website'].reduce((accum, key) => {
          // check key
          if (!(collection[key] || '').length) return accum;

          // set key
          accum[key] = collection[key];

          // return accumulator
          return accum;
        }, {})),
      });

      // images
      actualCollection.set('images', {
        ...(actualCollection.get('images') || {}),
        ...(['banner', 'poster', 'thumbnail'].reduce((accum, key) => {
          // check key
          if (!(collection[key] || '').length) return accum;

          // set key
          accum[key] = {
            url  : collection[key],
            type : 'url',
          };

          // return accumulator
          return accum;
        }, {})),
      });

      // set refs
      actualCollection.set('refs', Array.from(
        new Set([...actualCollection.get('refs'), `account:${actualCollection.get('account')}`, `provider:${actualCollection.get('provider')}`])
      ));

      // save collection
      await actualCollection.save();
    }));
  }
}