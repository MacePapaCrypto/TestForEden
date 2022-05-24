// import
import fetch from 'node-fetch';
import config from '../config';
import ERC721 from '../contracts/ERC721';

// create class
class MoralisAPI {

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
  async getOwns(address, chains = ['ethereum', 'binance', 'matic', 'fantom', 'avalanche'], type = ['ERC721']) {
    // return get
    let moralisData = [];

    // loop
    await Promise.all(chains.map(async (chain) => {
      // get data
      const data = await this.call('GET', `/${address}/nft?chain=${chain}&format=decimal`);

      // push
      moralisData.push(...(data.result || []).map((result) => {
        result.chain = chain;
        return result;
      }));
    }));

    // filter data
    moralisData = moralisData.filter((item) => item.token_uri && type.includes(item.contract_type));

    // return mapped
    return moralisData.map((item) => {
      /*
        {
          !token_address: '0xc70aae0bd664255236143cc1b92a7bd9b2ef019e',
          !token_id: '421',
          !amount: '1',
          !owner_of: '0x9d4150274f0a67985a53513767ebf5988cef45a4',
          !token_hash: 'f793628a93f9e110d597c54c347acd48',
          !block_number_minted: '17387969',      
          !block_number: '37374044',
          !contract_type: 'ERC721',
          !name: 'Bruce the Goose',
          !symbol: 'BTG',
          !token_uri: 'https://ipfs.moralis.io:2053/ipfs/QmUVsPe4y8osG96gtrGMAzGGce1Ni1oHpef8h742Aegg2n/421',
          !metadata: null,
          synced_at: '2021-11-22T18:43:28.927Z',
          last_token_uri_sync: null,
          last_metadata_sync: null
        }  
      */

      // uri
      const uri = item.token_uri.split('/ipfs/').length === 1 ? item.token_uri : `ipfs://${item.token_uri.split('/ipfs/')[1]}`;

      // return data
      return {
        uri      : uri,
        name     : item.name,
        hash     : item.token_hash,
        chain    : item.chain,
        symbol   : item.symbol,
        amount   : parseInt(item.amount),
        account  : item.owner_of,
        tokenId  : item.token_id,
        category : item.contract_type,
        metadata : typeof item.metadata === 'string' ? JSON.parse(item.metadata) : null,

        block : {
          number : item.block_number,
          minted : item.block_number_minted,
        },

        contract : item.token_address,
      }
    });
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