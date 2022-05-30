// import
import fetch from 'node-fetch';
import config from '../config';
import jobUtility from '../utilities/job';
import Bottleneck from 'bottleneck';
import ProgressBar from 'cli-progress';
import ERC721 from '../contracts/ERC721';
import CacheModel from '../models/cache';

// create class
class MoralisAPI {
  private __syncBottleneck = new Bottleneck({
    maxConcurrent : 10,
  });

  /**
   * call api url
   *
   * @param method 
   * @param url 
   * @returns 
   */
  async call(method, url) {
    // node fetch
    const res = await fetch(`https://deep-index.moralis.io/api/v2${url}`, {
      method,
      headers : {
        accept      : 'application/json',
        'X-API-Key' : config.get('moralis.key'),
      },
    });

    // return json
    return await res.json();
  }

  /**
   * returns total chain NFT balance
   *
   * @param address 
   */
  async syncOwnership(address, chains = ['ethereum', 'binance', 'matic', 'fantom', 'avalanche']) {
    // return get
    let moralisData = [];

    // loop
    await Promise.all(chains.map(async (chain) => {
      // let cursor
      let cursor = null;

      // do while
      do {
        // get contract data
        const transferData = await this.call('GET', `/nft/transfers?chain=${chain}&format=decimal&address=${address}&from_block=0${cursor ? `&cursor=${cursor}` : ''}`);

        // cursor
        cursor = transferData.cursor;

        // push data
        transferData.result.forEach((tx) => moralisData.push({
          ...tx,

          chain,
        }));
      } while (cursor !== '' && cursor !== null);
    }));

    // await again
    await Promise.all(moralisData.map((data) => {
      // load owned
      return ERC721.loadTransaction({
        way       : 'in',
        hash      : data.transaction_hash,
        from      : data.from_address,
        chain     : data.chain,
        block     : data.block_number,
        index     : data.transaction_index,
        amount    : parseInt(data.amount),
        account   : data.to_address,
        tokenId   : data.token_id,
        logIndex  : data.log_index,
        contract  : data.token_address,
        verified  : !!data.verified,
        createdAt : new Date(data.block_timestamp),
      });
    }));

    // return true
    return true;
  }

  /**
   * emit transfers
   *
   * @param chain 
   * @param cursor 
   * @param limit 
   */
  async syncHistoricTransfers(chain = 'ethereum') {
    // check chain
    const actualChain = chain;
    if (chain === 'ethereum') chain = 'eth';

    // cursor
    let cursor = null;

    // progress
    let progressBar;
    let progressTotal = 0;
    
    // set to cache
    const cachedFrom = await CacheModel.findById(`sync:${chain}:from`) || new CacheModel({
      id    : `sync:${chain}:from`,
      value : null,
    });
    
    // set to cache
    const cachedTo = await CacheModel.findById(`sync:${chain}:to`) || new CacheModel({
      id    : `sync:${chain}:to`,
      value : null,
    });

    // from block
    const toBlock = (cachedFrom.get('value') || 1) - 1;

    // try/catch
    try {
      // do while
      do {
        // get contract data
        const transferData = await this.call('GET', `/nft/transfers?chain=${chain}&order=block_timestamp.asc&format=decimal&from_block=0${toBlock ? `&to_block=${toBlock}` : ''}${cursor ? `&cursor=${cursor}` : ''}`);

        // check bar
        if (!progressBar) {
          progressBar = new ProgressBar.SingleBar({}, ProgressBar.Presets.shades_classic);
          progressBar.start(transferData.total, 0);
        }

        // add to total
        progressTotal = (progressTotal + transferData.result.length);

        // add
        progressBar.update(progressTotal);

        // cursor
        cursor = transferData.cursor;

        // sort and get second
        const sortedBlocks = Array.from(new Set(transferData.result.map((tx) => parseInt(tx.block_number))));
        
        // min
        const minBlock = Math.min(...sortedBlocks);
        const maxBlock = Math.max(...sortedBlocks);

        // emit all transfers
        await this.__syncBottleneck.schedule(() => Promise.all(transferData.result.map((tx) => {
          // queue job
          return jobUtility.queue('tx', `${actualChain}:${tx.transaction_hash}:${tx.log_index}`, {
            ...tx,

            chain : actualChain,
          });
        })));

        // set earliest block
        if (!cachedFrom.get('value') || minBlock < cachedFrom.get('value')) {
          // set value
          cachedFrom.set('value', minBlock);
          await cachedFrom.save(null, true, false);
        }

        // set latest block
        if (!cachedTo.get('value') || maxBlock > cachedTo.get('value')) {
          // set value
          cachedTo.set('value', maxBlock);
          await cachedTo.save(null, true, false);
        }
      } while (cursor !== '' && cursor !== null);
    } catch (e) {
      // timeout and retry
      return setTimeout(() => this.syncHistoricTransfers(chain), 2000);
    }

    // stop
    progressBar.stop();
  }

  /**
   * get contract
   *
   * @param address 
   */
  async getContract(address, chain = 'ethereum') {
    // get contract data
    const contractData = await this.call('GET', `/nft/${address}/metadata?chain=${chain}`);

    // return parsed
    return {
      name    : contractData.name,
      type    : contractData.contract_type,
      synced  : new Date(contractData.synced_at),
      symbol  : contractData.symbol,
      address : contractData.token_address,
    };
  }
}

// export default
export default new MoralisAPI();