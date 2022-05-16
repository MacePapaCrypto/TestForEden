
// import fetch
import fetch from 'node-fetch';
import config from '../config';

/**
 * create ftm scan utility
 */
class FtmScanUtility {

  /**
   * get ABI for contract
   *
   * @param contract 
   */
  async getABI(contract) {
    // get abi
    const res = await fetch(`https://api.ftmscan.com/api?module=contract&action=getabi&address=${contract}&apikey=${config.get('ftmscan.api')}`);
    
    // get json
    const data = await res.json();

    // check result
    if (data.status !== '1') return;

    // return json
    return JSON.parse(data.result);
  }
  
  /**
   * get nft transactions
   *
   * @param contract 
   * @param address 
   * @param param2 
   */
  async getNFTTransactions(address, opts = {}) {
    // expound
    const { page = 1, offset = 100, sort = 'asc', startBlock = 0, endBlock = 99999999 } = opts;

    // get abi
    const res = await fetch(`https://api.ftmscan.com/api?module=account&action=tokennfttx&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=${page}&offset=${offset}&sort=${sort}&apikey=${config.get('ftmscan.api')}`);
    
    // get json
    const data = await res.json();

    // check result
    if (data.status !== '1') return [];

    // return json
    return data.result || [];
  }
}

// export default
export default new FtmScanUtility();