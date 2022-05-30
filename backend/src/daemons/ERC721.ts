
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
  @Action('erc721.tx.schedule', 10000, 'background')
  async transactionScheduleAction() {
    // await client
    await this.base.clientReady;

    // schedule
    job.schedule('tx', 1000, 1);
  }

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
          logIndex  : data.log_index,
          contract  : data.token_address,
          verified  : !!data.verified,
          createdAt : new Date(data.block_timestamp),
        }, false);
      });

      // done
      const inDone = await inTx;
      const outDone = await outTx;

      // return done
      return ((inDone || inDone === null) && (outDone || outDone === null));
    }, 50);
  }

  /**
   * sync fantom
   */
  @Action('erc721.contract', 10000, 'background')
  async contractAction() {
    // await client
    await this.base.clientReady;
    
    // schedule job
    job.worker('contract', async (data) => {
      // return type
      const contract = await ERC721.loadContract(data.chain, data.address, true, true);
      
      // return
      return contract === null || !!contract;
    }, 50);
  }

  /**
   * sync fantom
   */
  @Action('erc721.contract.schedule', 10000, 'background')
  async contractScheduleAction() {
    // await client
    await this.base.clientReady;

    // schedule
    job.schedule('contract', 100, 1000);
  }

  /**
   * sync fantom
   */
  @Action('erc721.nft', 10000, 'background')
  async nftAction() {
    // await client
    await this.base.clientReady;
    
    // schedule job
    job.worker('nft', async (data) => {
      // return type
      const nft = await ERC721.loadNFT(data.chain, data.contract, data.tokenId, true);
      
      // return
      return nft === null || !!nft;
    }, 50);
  }

  /**
   * sync fantom
   */
  @Action('erc721.nft.schedule', 10000, 'background')
  async nftScheduleAction() {
    // await client
    await this.base.clientReady;

    // schedule
    job.schedule('nft', 200, 1000);
  }
}