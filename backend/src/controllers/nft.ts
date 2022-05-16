
// import local
import NFTController, { Route } from '../base/controller';
import ERC721 from '../utilities/ERC721';
import OwnedModel from '../models/owned';

/**
 * create auth controller
 */
export default class NftController extends NFTController {

  /**
   * segment get endpoint
   * 
   * @returns
   */
  @Route('GET', '/nft/list')
  async listAction(req, { data, params }, next) {
    // lower address
    const lowerAddress = `${data.account || req.account}`.toLowerCase();

    // find all owned
    const ownedNFTs = await OwnedModel.findByOwner(lowerAddress, 1000);

    // background job
    if (!ownedNFTs.length) ERC721.loadAllOwned(lowerAddress);

    // return
    return {
      result  : await Promise.all(ownedNFTs.map((nft) => nft.toJSON())),
      success : true,
    };
  }
}