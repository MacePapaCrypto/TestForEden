
// import local
import NFTDaemon, { Action } from '../base/daemon';
import ERC721 from '../contracts/ERC721';
import job from '../utilities/job';

/**
 * create auth controller
 */
export default class ERC721Daemon extends NFTDaemon {

  /**
   * sync fantom
   */
  @Action('erc721.tx', 10000, 'background')
  async transactionAction() {
    // await client
    await this.base.clientReady;
    
    // schedule job
    job.worker('tx', async (data) => {
      // load contract
      const [inTx, outTx] = ['in', 'out'].map((type) => {
        // return type
        return ERC721.loadTransaction({
          way       : type,
          hash      : data.transaction_hash,
          from      : type === 'in' ? data.from_address : data.to_address,
          chain     : data.chain,
          block     : data.block_number,
          index     : data.transaction_index,
          amount    : parseInt(data.amount),
          account   : type === 'out' ? data.from_address : data.to_address,
          tokenId   : data.token_id,
          contract  : data.token_address,
          verified  : !!data.verified,
          createdAt : new Date(data.block_timestamp),
        });
      });

      // await
      return !!(await inTx && await outTx);
    }, 10);
  }
}