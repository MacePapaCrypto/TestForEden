
// import local
import NFTDaemon, { Action } from '../base/daemon';
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
      console.log('work data', data);

      await new Promise((resolve) => setTimeout(resolve, 30 * 60 * 1000));
    }, 2);
  }
}