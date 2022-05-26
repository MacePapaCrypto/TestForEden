
// import
import request from 'request';

// import local
import NFTController, { Route } from '../base/controller';
import ERC721 from '../contracts/ERC721';

// models
import config from '../config';
import NFTModel from '../models/nft';
import UserModel from '../models/user';
import NFTOwnedModel from '../models/nftOwned';

/**
 * create auth controller
 */
export default class NftController extends NFTController {

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/nft/list')
  async listAction(req, { data, params }, next) {
    // lower address
    const lowerAddress = `${data.account || req.account}`.toLowerCase();

    // load owned
    const owned = await NFTOwnedModel.findByOwner(lowerAddress, data.limit || 100, 'contract', 'asc');

    // get total
    const user = await UserModel.findById(lowerAddress);

    // cache
    const cache = {};

    // return
    return {
      result  : {
        data  : await Promise.all(owned.map((nft) => nft.toJSON(cache, data.include === 'contract'))),
        total : user ? user.get('count.nfts') : 0,
      },
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/nft-media/:contract')
  async mediaAction(req, res, next) {
    // contract/token
    const [chain, contract, token] = res.params.contract.split('-');

    // load nft contract
    const actualContract = await ERC721.loadContract(contract, chain, false);

    // check collection
    if (!actualContract) {
      // no collection
      res.statusCode = 404;

      // not found
      return 'Contract not found';
    }

    // load nft
    const actualNft = await NFTModel.findById(`${chain}:${contract}:${token}`.toLowerCase());

    // check collection
    if (!actualNft) {
      // no collection
      res.statusCode = 404;

      // not found
      return 'NFT not found';
    }

    // replace ipfs
    let nftUrl = actualNft.get('image.url');

    // check gateway
    if (nftUrl.includes('/ipfs/')) {
      // ipfs fix
      nftUrl = `${config.get('ipfs.url')}${nftUrl.split('/ipfs/')[1]}`;
    }
    if (nftUrl.includes('ipfs://')) {
      nftUrl = nftUrl.replace('ipfs://', config.get('ipfs.url'));
    }
    
    // pipe
    request(nftUrl).on('response', (nftRes) => {
      // headers
      nftRes.headers['x-nft-chain'] = chain.toLowerCase();
      nftRes.headers['x-nft-token'] = token.toLowerCase();
      nftRes.headers['x-nft-contract'] = contract.toLowerCase();

      // delete
      delete nftRes.headers['set-cookie'];
    }).pipe(res);
  }
}