
// import local
import NFTController, { Route } from '../base/controller';
import ERC721 from '../utilities/ERC721';
import ftmscan from '../utilities/ftmscan';
import CollectionModel from '../models/collection';

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

    // load transactions from api
    const transactions = await ftmscan.getNFTTransactions(lowerAddress);

    // parse out transaction
    const parsedTransactions = (await Promise.all(transactions.map((tx) => {
      // get nft
      return ERC721.getNFT(tx.contractAddress, tx.tokenID);
    }))).filter((t) => t);

    // parse cache
    const parseCache = {}

    // reduce
    const result = await Promise.all(Object.values(transactions.reduce((accum, tx) => {
      // get id
      const id = `${tx.contractAddress}:${tx.tokenID}`.toLowerCase();

      // find parsed
      const parsed = parsedTransactions.find((t) => t.get('id') === id);

      // check parsed
      if (!parsed) return accum;

      // check exists
      if (!accum[id]) accum[id] = {
        transactions : [],
        parsed,
        count : 0,
      };

      // get direction
      const received = `${tx.to}`.toLowerCase() === lowerAddress;

      // add to accum count
      accum[id].transactions.push(tx);
      accum[id].count = received ? (accum[id].count + 1) : (accum[id].count - 1);

      // return accum
      return accum;
    }, {})).filter((item) => item.count > 0).map((item) => item.parsed.toJSON(parseCache, item.transactions, item.count)));

    // return
    return {
      result,
      success : true,
    };
  }
}