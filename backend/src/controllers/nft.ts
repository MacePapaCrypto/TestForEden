
// import
import request from 'request';

// import local
import NFTController, { Route } from '../base/controller';
import ERC721 from '../contracts/ERC721';

// models
import config from '../config';
import NFTModel from '../models/nft';
import NFTOwnedModel from '../models/nftOwned';
import ContractModel from '../models/contract';

/**
 * create auth controller
 */
export default class NftController extends NFTController {

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/contract/list')
  async featuredAction(req, { data, params }, next) {
    // load contracts
    const contracts = await ContractModel.findByRef('chain:fantom', data.limit || 10, 'createdAt', 'asc');

    // cache
    const cache = {};

    // return
    return {
      result  : await Promise.all(contracts.map((contract) => contract.toJSON(cache))),
      success : true,
    };
  }

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/api/v1/nft/list')
  async listAction(req, { data, params }, next) {
    // let
    let owned, total;

    // check account
    if (data.account) {
      // lower address
      const lowerAddress = `${data.account}`.toLowerCase();
  
      // load owned
      owned = await NFTOwnedModel.findByOwner(lowerAddress, data.limit || 100, 'contract', 'asc');
      total = await NFTOwnedModel.countByOwner(lowerAddress);
    } else if (data.contract) {
      // lower address
      const lowerAddress = `${data.contract}`.toLowerCase().split(':').pop();
  
      // load owned
      owned = await NFTModel.findByContract(lowerAddress, data.limit || 10, 'createdAt', 'asc');
      total = await NFTModel.countByContract(lowerAddress);
    }

    // cache
    const cache = {};

    // return
    return {
      result  : {
        data : await Promise.all(owned.map((nft) => nft.toJSON(cache, data.include === 'contract'))),
        total,
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