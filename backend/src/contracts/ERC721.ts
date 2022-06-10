
// import models
import fetch from 'node-fetch';
import { ethers } from 'ethers';
import config from '../config';
import moralis from '../apis/moralis';
import Bottleneck from 'bottleneck';
import { AbortController } from 'node-abort-controller';

// models
import NftModel from '../models/nft';
import UserModel from '../models/user';
import NftOwnedModel from '../models/nftOwned';
import ContractModel from '../models/contract';

// *scans
import ftmScan from '../apis/fantom';
import ethScan from '../apis/ethereum';
import avaScan from '../apis/avalanche';
import bscScan from '../apis/binance';
import mtcScan from '../apis/polygon';

// providers
import avaProvider from '../providers/avalanche';
import ftmProvider from '../providers/fantom';
import ethProvider from '../providers/ethereum';
import mtcProvider from '../providers/polygon';
import bscProvider from '../providers/binance';
import job from '../utilities/job';

// timeout
const fetchTimeout = async (resource, options = {}) => {
  // create timeout
  const { timeout = 30 * 1000 } = options;
  
  // create request
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });

  // clear
  clearTimeout(id);

  // return
  return response;
};

// nft transaction interface
interface NFTTransaction {
  way : 'in' | 'out',
  hash : string,
  from : string,
  chain : string,
  block : string | number,
  index : string | number,
  amount : number,
  account : string,
  tokenId : string,
  logIndex : string | number,
  contract : string,
  verified : boolean,
  createdAt : Date,
};

/**
 * create utility
 */
class ERC721Contract {
  // set loading
  private __loading = {};
  private __nftBottleneck = new Bottleneck({
    maxConcurrent : config.get('bottleneck.nft'),
  });
  private __ownedBottleneck = new Bottleneck({
    maxConcurrent : config.get('bottleneck.owned'),
  });
  private __contractBottleneck = new Bottleneck({
    maxConcurrent : config.get('bottleneck.contract'),
  });

  /**
   * loads all nfts
   *
   * @param address
   */
  async loadOwned(address, ...args) {
    // lower
    const lowerAddress = address.toLowerCase();

    // syncing
    (async () => {
      // create lock
      const unlock = await NftOwnedModel.pubsub.lock(lowerAddress);

      // try/catch
      try {
        // load user model
        const userModel = await UserModel.findById(lowerAddress) || new UserModel({
          id : lowerAddress,
        });

        // set count
        userModel.set('synced.nfts', false);
        userModel.set('syncing.nfts', new Date());
        await userModel.save();
      } catch (e) {}

      // unlock
      unlock();
    })();

    // sync ownership
    await moralis.syncOwnership(lowerAddress, ...args);

    // syncing
    (async () => {
      // create lock
      const unlock = await NftOwnedModel.pubsub.lock(lowerAddress);

      // try/catch
      try {
        // load user model
        const userModel = await UserModel.findById(lowerAddress) || new UserModel({
          id : lowerAddress,
        });

        // set count
        userModel.set('synced.nfts', new Date());
        userModel.set('syncing.nfts', false);
        await userModel.save();
      } catch (e) {}

      // unlock
      unlock();
    })();
  }

  /**
   * gets ERC721 contract
   *
   * @param contract 
   */
  loadContract(chain, address, requireAbi = true, forceLoad = true) {
    // contract id
    const contractId = `${chain}:${address}`.toLowerCase();

    // check loading
    if (this.__loading[contractId]) return this.__loading[contractId];

    // create loading
    this.__loading[contractId] = this.__contractBottleneck.schedule(async () => {
      // try/catch
      try {
        // load from db
        let actualContract = await ContractModel.findById(contractId, false);
    
        // check contract
        if (actualContract && (!requireAbi || actualContract.get('abi'))) return actualContract;

        // create scrape job
        if (!forceLoad) {
          // queue
          job.queue('contract', contractId, {
            chain,
            address,
          });

          // return job
          return 'queued';
        }
    
        // load contract
        const newContract = actualContract || new ContractModel({
          id      : contractId,
          address : address.toLowerCase(),
          
          chain,

          refs : [
            `chain:${chain}`,
            `address:${address}`.toLowerCase(),
          ]
        });
    
        // get contract
        const contractMeta = await moralis.getContract(newContract.get('address'), chain);
    
        // set
        newContract.set('name', contractMeta.name);
        newContract.set('synced', contractMeta.synced);
        newContract.set('symbol', contractMeta.symbol);
        newContract.set('category', contractMeta.type);
    
        // set refs
        newContract.set('refs', Array.from(new Set([
          ...(newContract.get('refs') || []),
    
          `category:${contractMeta.type}`,
        ])));
    
        // load abi
        if (chain === 'fantom') {
          // get abi
          newContract.set('abi', await ftmScan.getABI(newContract.get('address')));
        } else if (chain === 'ethereum') {
          // get abi
          newContract.set('abi', await ethScan.getABI(newContract.get('address')));
        } else if (chain === 'matic') {
          // get abi
          newContract.set('abi', await mtcScan.getABI(newContract.get('address')));
        } else if (chain === 'binance') {
          // get abi
          newContract.set('abi', await bscScan.getABI(newContract.get('address')));
        } else if (chain === 'avalanche') {
          // get abi
          newContract.set('abi', await avaScan.getABI(newContract.get('address')));
        }
    
        // save new contract
        newContract.save(true, false, false);
    
        // create ethers contract
        return newContract;
      } catch (e) { console.log('contract error', e) }
    });

    // then
    this.__loading[contractId].then(() => {
      // timeout kill cache
      setTimeout(() => {
        // delete
        delete this.__loading[contractId];
      }, 30 * 1000);
    });

    // return done
    return this.__loading[contractId];
  }

  /**
   * gets NFT from contract
   *
   * @param nftData
   */
  loadNFT(chain, contract, tokenId, forceLoad = true) {
    // nft id
    const nftId = `${chain}:${contract}:${tokenId}`.toLowerCase();

    // let uri
    let nftUri, imgUri;

    // check loading
    if (this.__loading[nftId]) return this.__loading[nftId];

    // create promise
    this.__loading[nftId] = this.__nftBottleneck.schedule(async () => {
      // try/catch
      try {
        // existing nft
        const existingNFT = await NftModel.findById(nftId);

        // if existing
        if (existingNFT) {
          // return existing
          return existingNFT;
        } else if (!forceLoad) {
          // load contract
          this.loadContract(chain, contract, true, false);

          // queue
          job.queue('nft', nftId, {
            chain,
            tokenId,
            contract,
          });

          // return job
          return 'queued';
        }
        
        // update
        let update = false;

        // parsed data
        const parsedData = {
          chain,
          tokenId,
          contract,
        };

        // get contract
        const actualContract = await this.loadContract(chain, contract, true, false);

        // check queued
        if (actualContract === 'queued') {
          // queue
          job.queue('nft', nftId, {
            chain,
            tokenId,
            contract,
          });

          // return job
          return 'queued';
        }
      
        // check contract model
        if (actualContract === null) return null;
        if (!actualContract) return;

        // find by nft model
        const nftModel = existingNFT || new NftModel({
          id : nftId,
          
          ...parsedData,
        });

        // check uri
        if (!nftModel.get('uri') && actualContract.get('abi')) {
          // get provider
          let provider;

          // check providers
          if (nftModel.get('chain') === 'fantom') {
            provider = ftmProvider;
          } else if (nftModel.get('chain') === 'ethereum') {
            provider = ethProvider;
          } else if (nftModel.get('chain') === 'binance') {
            provider = bscProvider;
          } else if (nftModel.get('chain') === 'matic') {
            provider = mtcProvider;
          } else if (nftModel.get('chain') === 'avalanche') {
            provider = avaProvider;
          }

          // create contract
          const ERC721Contract = new ethers.Contract(actualContract.get('address'), actualContract.get('abi'), provider);

          // return null
          try {
            // get token uri
            let tokenURI = await ERC721Contract.functions.tokenURI(tokenId);
                tokenURI = Array.isArray(tokenURI) ? tokenURI[0] : tokenURI;

            // load actual model
            nftModel.set('uri', tokenURI);
          } catch (e) {
            // check not a function
            if (`${e}`.includes('Not exist')) return null;
            if (`${e}`.includes('DoesNotExist')) return null;
            if (`${e}`.includes(`doesn't exist`)) return null;
            if (`${e}`.includes('does not exist')) return null;
            if (`${e}`.includes('nonexistent token')) return null;
            if (`${e}`.includes('is not a function')) return null;

            // return
            return;
          }

          // update
          update = true;
        }

        // check uri
        if (!nftModel.get('uri')) return null;

        // set uri
        nftUri = nftModel.get('uri');

        // check data
        if (!nftModel.get('image')) {
          // data
          let NFTMeta = null;
          let NFTImage = null;

          // check if ipfs
          if (nftModel.get('uri').includes('base64,')) {
            // create req
            const NFTReq = new Buffer(nftModel.get('uri').split('base64,').pop(), 'base64');
            NFTMeta = JSON.parse(NFTReq.toString('ascii'));
          } else {
            // try/catch
            try {
              // uri
              let uri = nftModel.get('uri').replace('ipfs://', config.get('ipfs.url'));
              
              // replace /ipfs/
              uri = uri.includes('/ipfs/') ? `${config.get('ipfs.url')}${uri.split('/ipfs/')[1]}` : uri;

              // check includes https
              if (uri && !uri.includes('://')) uri = `${config.get('ipfs.url')}${uri}`;

              // data
              const NFTReq = await fetchTimeout(uri);
              NFTMeta = await NFTReq.json();
            } catch (e) {
              // check error
              if (e.type === 'aborted') return;
              if (e.code === 'EAI_AGAIN') return null;
              if (e.code === 'ENOTFOUND') return null;
              if (e.code === 'ECONNREFUSED') return null;
              if (e.type === 'invalid-json') return null;

              // throw error
              throw e;
            }
          }

          // set imgUri
          imgUri = NFTMeta?.image;

          // image
          if (NFTMeta?.image?.includes('base64,')) {
            // support base64
            NFTImage = {
              url  : NFTMeta.image,
              type : NFTMeta.image.split('data:')[1].split(';')[0],
            };
          } else {
            // try/catch
            try {
              // uri
              let uri = NFTMeta.image ? NFTMeta.image.replace('ipfs://', config.get('ipfs.url')) : null;
              
              // replace /ipfs/
              uri = uri && (uri.includes('/ipfs/') ? `${config.get('ipfs.url')}${uri.split('/ipfs/')[1]}` : uri);

              // check includes https
              if (uri && !uri.includes('://')) uri = `${config.get('ipfs.url')}${uri}`;

              // image
              const NFTRes = uri && await fetchTimeout(uri);
              NFTImage = NFTRes ? {
                url  : NFTMeta.image,
                type : NFTRes.headers.get('content-type'),
                size : NFTRes.headers.get('content-length'),
              } : {};
            } catch (e) {
              // check error
              if (e.type === 'aborted') return;
              if (e.code === 'EAI_AGAIN') return null;
              if (e.code === 'ENOTFOUND') return null;
              if (e.code === 'ECONNREFUSED') return null;

              // throw error
              throw e;
            }
          }

          // check data
          if (!NFTMeta) return;
          if (!NFTImage) return;

          // set value
          nftModel.set('refs', Array.from(new Set([
            ...(nftModel.get('refs') || []),

            `category:${nftModel.get('category')}`,
            `contract:${nftModel.get('contract')}`,
          ])));
          nftModel.set('name', NFTMeta?.name || nftModel.get('name'));
          nftModel.set('image', NFTImage);
          nftModel.set('metadata', NFTMeta);

          // update
          update = true;
        }

        // if update
        if (update) nftModel.save(true, true);

        // return nft model
        return nftModel;
      } catch (e) { console.log('nft error', e, nftUri, imgUri) }
    });

    // then
    this.__loading[nftId].then(() => {
      // timeout kill cache
      setTimeout(() => {
        // delete
        delete this.__loading[nftId];
      }, 30 * 1000);
    });

    // return done
    return this.__loading[nftId];
  }

  /**
   * load owned
   *
   * @param nftData 
   */
  loadTransaction(tx: NFTTransaction, forceLoad = true) {
    // owned id
    const ownedId = `${tx.account}:${tx.chain}:${tx.contract}:${tx.tokenId}`.toLowerCase();

    // check account
    if (tx.account === '0x0000000000000000000000000000000000000000') return null;

    // check loading
    if (this.__loading[ownedId]) return this.__loading[ownedId];

    // create promise
    this.__loading[ownedId] = this.__ownedBottleneck.schedule(async () => {
      // create lock
      const ownedLock = await global.backend.pubsub.lock(ownedId);
      let ownedNFT;

      // try/catch
      try {
        // check owned
        let changing = false;
        let creating = false;

        // load owned nft
        ownedNFT = await NftOwnedModel.findById(ownedId);

        // check owned
        if (!ownedNFT) {
          // get nft
          this.loadNFT(tx.chain, tx.contract, tx.tokenId, forceLoad);

          // creating
          creating = true;
          ownedNFT = new NftOwnedModel({
            id        : ownedId,
            nft       : `${tx.chain}:${tx.contract}:${tx.tokenId}`.toLowerCase(),
            txs       : [],
            chain     : tx.chain.toLowerCase(),
            amount    : 0,
            tokenId   : tx.tokenId,
            account   : tx.account.toLowerCase(),
            verified  : false,
            contract  : tx.contract.toLowerCase(),
            createdAt : new Date(tx.createdAt),
          });;
        }

        // push transaction if not exists
        if (!(ownedNFT.get('txs') || []).find((stx) => stx.hash === tx.hash && stx.logIndex === parseInt(tx.logIndex))) {
          // changing
          changing = true;

          // txs
          const nftTxs = (ownedNFT.get('txs') || []);
          nftTxs.push({
            way       : tx.way,
            from      : tx.from,
            hash      : tx.hash,
            amount    : tx.amount,
            logIndex  : parseInt(tx.logIndex),
            createdAt : new Date(tx.createdAt),
          });

          // push transaction
          ownedNFT.set('txs', nftTxs);
        }

        // actual amount
        const actualAmount = (ownedNFT.get('txs') || []).reduce((accum, tx) => {
          // amount
          return accum + (tx.way === 'in' ? tx.amount : (tx.amount * -1));
        }, 0);

        // check amount
        if (ownedNFT.get('amount') !== actualAmount) {
          // changing
          changing = true;

          // set amount
          ownedNFT.set('amount', actualAmount);
        }

        // check amount
        if (ownedNFT.get('way') !== ((ownedNFT.get('amount') > 0) ? 'in' : 'out')) {
          // changing
          changing = true;

          // set owned
          ownedNFT.set('way', ((ownedNFT.get('amount') > 0) ? 'in' : 'out'));
        }

        // check created
        if (new Date(ownedNFT.get('createdAt')) > new Date(tx.createdAt)) {
          // changing
          changing = true;

          // set owned
          ownedNFT.set('createdAt', new Date(tx.createdAt));
        }

        // all other info
        ['contract', 'chain', 'account', 'tokenId'].forEach((key) => {
          // check equals
          if (`${tx[key]}`.toLowerCase() !== `${ownedNFT.get(key)}`.toLowerCase()) {
            // changing
            changing = true;
            
            // set key
            ownedNFT.set(key, `${tx[key]}`.toLowerCase());
          }
        });

        // check changed
        if (changing || creating) {
          // set refs
          ownedNFT.set('refs', Array.from(new Set([
            `account:${tx.account}`,
            `contract:${tx.contract}`,
            `${ownedNFT.get('way')}:${tx.account}`,
            `${ownedNFT.get('way')}:${tx.contract}`,
            `${ownedNFT.get('verified') ? 'verified' : 'unverified'}:${ownedNFT.get('way')}:${tx.account}`,
            `${ownedNFT.get('verified') ? 'verified' : 'unverified'}:${ownedNFT.get('way')}:${tx.contract}`,
          ])).map((key) => key.toLowerCase()));

          // save nft
          ownedNFT.save(true, true);
        }
      } catch (e) { console.log('owned error', e) }

      // unlock
      ownedLock();

      // return
      return ownedNFT;
    });

    // then
    this.__loading[ownedId].then(() => {
      // timeout kill cache
      setTimeout(() => {
        // delete
        delete this.__loading[ownedId];
      }, 30 * 1000);
    });

    // return done
    return this.__loading[ownedId];
  }
}

// new contract
export default new ERC721Contract();