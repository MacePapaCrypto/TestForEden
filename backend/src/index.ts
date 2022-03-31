
// import events
import fs from 'fs-extra';
import cors from 'cors';
import polka from 'polka';
import Events from 'events';
import Trouter from 'trouter';
import cassandra from 'cassandra-driver';
import { Server } from 'socket.io';

// local dependencies
import config from './config';
import controllers from './controllers';

// events
class NFTBackend extends Events {
  // built controllers
  private __router = new Trouter();
  private __builtRoutes = [];
  private __builtControllers = {};

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
    await this.__controllers();
  }

  /**
   * setup server
   */
  async __server() {
    // listen
    this.app = polka();

    // use cors
    this.app.use(cors({
      origin : true,
    }));

    // listen
    this.app.listen(config.get('http.port'));

    // socket io
    this.io = new Server(this.app.server, {
      path : '/nft/',
      cors : {
        origin : '*',
      }
    });

    // on connection
    this.io.on('connection', (socket) => {
      // on connection
      this.emit('connection', socket);

      // set initial acls
      socket.acl = ['nouser'];

      // on disconnect
      socket.on('disconnect', () => this.emit('disconnection', socket));

      // add router listener
      socket.on('call', (id, method, path, data) => {
        // find routes
        const { params, handlers } = this.__router.find(method, path);

        // handlers
        let handlerI = -1;

        // load handler
        const next = async () => {
          // nexted
          let nexted = false;

          // add 1
          handlerI = handlerI + 1;

          // get handler
          const handler = handlers[handlerI];

          // check handler
          if (!handler) return socket.emit(id, {
            code : 404,
          });

          // load data
          const { call, acl } = handler();

          // let result
          let result;

          // try/catch
          try {
            // create function
            result = await call(socket, { params, data }, () => {
              nexted = true;
              next();
            });
            
            // success
            if (typeof result.success === 'undefined') result = {
              result,
              success : true,
            };
          } catch (e) {
            // failed
            result = {
              success : false,
              message : e,
            }
          }

          // check nexted
          if (nexted) return;

          // return result
          socket.emit(id, result);
        };

        // first next
        next();
      });
    });
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
      console.log('cassandra ready...');

      // resolve
      resolve(true);
    });
  }

  /**
   * builds controllers
   */
  async __controllers() {
    // all routes
    let allRoutes = [];

    // loop controllers
    await Promise.all(Object.keys(controllers).map(async (key) => {
      // build controller
      this.__builtControllers[key] = new controllers[key](this);

      // await building
      await this.__builtControllers[key].building;

      // get routes
      allRoutes.push(...(this.__builtControllers[key].routes || []));
    }));

    // sort all routes
    allRoutes = allRoutes.sort((a, b) => {
      // priority
      const aP = a.priority || 100;
      const bP = b.priority || 100;

      // sort
      if (aP > bP) return 1;
      if (aP < bP) return -1;
      return 0;
    });

    // add routes
    allRoutes.forEach(({ acl, ctrl, method, path, priority, property }) => {
      // add method
      this.__router.add(method, path, () => {
        // return data
        return {
          call : ctrl[property],

          acl,
          priority,
        };
      });
    });

    // set routes
    this.__builtRoutes = allRoutes;
  }
}

// export default
const backend = new NFTBackend();

// export default
export default backend;