
// import events
import fs from 'fs-extra';
import polka from 'polka';
import Events from 'events';
import cassandra from 'cassandra-driver';

// local dependencies
import config from './config';

// events
class NFTBackend extends Events {

  /**
   * constructor
   */
  constructor() {
    // run super
    super();

    // run build
    this.building = this.build();
  }

  /**
   * build
   */
  async build() {
    // await database
    await this.__server();
    await this.__database();
  }

  /**
   * setup server
   */
  async __server() {
    // listen
    this.server = polka().listen(9696);
  }

  /**
   * build database
   */
  async __database() {
    // get config
    const db = config.get('db');

    // username and password provider from settings
    const authProvider = new cassandra.auth.PlainTextAuthProvider(db.username, db.password);

    // ssl options
    const sslOptions = {
      ca : [
        fs.readFileSync(`${global.appRoot}/sf-class2-root.crt`, 'utf-8')
      ],    
      host               : db.hostname,
      rejectUnauthorized : true,
    };

    // public hostname for keyspaces
    const contactPoints = [db.hostname];

    // setup cassandra client
    this.client = new cassandra.Client({
      contactPoints,
      authProvider,
      sslOptions,

      keyspace        : db.keyspace,
      localDataCenter : db.region,

      queryOptions : {
        consistency : cassandra.types.consistencies.localQuorum,
      },
      protocolOptions : {
        port : 9142,
      }
    });

    // create on ready event
    this.clientReady = new Promise(async (resolve) => {
      // try/catch
      try {
        await this.client.execute('SELECT * FROM models LIMIT 1', []);
      } catch (e) { console.log(e) }
      
      // log cassandra ready
      console.log('cassandra ready');

      // resolve
      resolve(true);
    });
  }
}

// export default
const backend = new NFTBackend();

// export default
export default backend;