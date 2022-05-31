
// import local
import moralis from '../apis/moralis';
import NFTDaemon, { Action } from '../base/daemon';

/**
 * create auth controller
 */
export default class MoralisDaemon extends NFTDaemon {

  /**
   * sync fantom
   */
  @Action('fantom.sync.historic', 10000, 'background')
  async fantomSync() {
    // await client
    await this.base.clientReady;

    // sync with moralis
    moralis.syncHistoricTransfers('fantom');
  }

  /**
   * sync ethereum
   */
  @Action('ethereum.sync.historic', 10000, 'background')
  async ethereumSync() {
    // await client
    await this.base.clientReady;

    // sync with moralis
    moralis.syncHistoricTransfers('ethereum');
  }
}