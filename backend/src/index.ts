
// import events
import fs from 'fs-extra';
import cors from 'cors';
import polka from 'polka';
import Events from 'events';
import winston from 'winston';
import Trouter from 'trouter';
import cassandra from 'cassandra-driver';
import { Server } from 'socket.io';

// local dependencies
// import Media from './base/media';
import config from './config';
import daemons from './daemons';
import NFTModel from './base/model';
import NFTPubSub from './utilities/pubsub';
import controllers from './controllers';

// events
class NFTBackend extends Events {
  // built controllers
  private __html = fs.readFileSync(`${__dirname}/index.html`, 'utf-8');
  private __router = new Trouter();
  private __builtRoutes = [];
  private __builtDaemons = {};
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
    await this.__logger();
    await this.__pubsub();
    await this.__database();

    // daemons
    if (process.env.DAEMON) {
      await this.__daemons();
    }
    if (process.env.SERVER) {
      await this.__server();
      await this.__controllers();
    }
  }

  /**
   * create logger
   */
  async __logger() {
    // create logger
    this.logger = winston.createLogger({
      level      : 'info',
      format     : winston.format.json(),
      transports : [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({
          level    : 'error',
          filename : 'error.log',
        }),
      ],
    });

    // console logger
    this.logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));

    // info
    this.logger.info('logger created');
  }

  /**
   * creat pubsub
   */
  async __pubsub() {
    // info
    this.logger.info('pubsub creating');

    // create pubsub
    this.pubsub = new NFTPubSub(config.get('pubsub'));

    // info
    this.logger.info('pubsub created');
  }

  /**
   * setup server
   */
  async __server() {
    // info
    this.logger.info('server creating');

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
      path : '/nft',
      cors : {
        origin : '*',
      }
    });
    
    // on connection
    this.io.on('connection', async (socket) => {
      // on connection
      this.emit('connection', socket);
      
      // set session id
      socket.ssid = socket.handshake.query.ssid;

      // set initial acls
      socket.acl = ['nouser'];
      
      // add media to socket
      // const media = new Media.Media(socket);

      // subscriptions
      socket.subscriptions = new Map();

      // unsubscribe
      socket.unsubscribe = (channel): void => {
        // add unsubscribe logic
        if (channel) {
          // create subscription
          this.pubsub.off(type, socket.subscriptions.get(type));
          return socket.subscriptions.delete(type);
        }
        
        // loop and unsubscribe
        Array.from(socket.subscriptions.keys()).forEach((key) => {
          // create subscription
          this.pubsub.off(key, socket.subscriptions.get(key));
          socket.subscriptions.delete(key);
        });
      };
      socket.subscribe = (channel, fn): void => {
        // check fn
        if (typeof fn !== 'function') {
          // log
          console.error(`subscription function ${channel} not found`);
          return;
        }

        // check has
        if (socket.subscriptions.has(channel)) return;

        // create pushed event
        socket.subscriptions.set(channel, (...args) => {
          // try/catch function
          try {
            // create event
            fn(socket, ...args);
          } catch (e) {
            // error
            console.error(`subscription function ${channel} failed ${e.toString()}`);
          }
        });

        // create subscription
        this.pubsub.on(channel, socket.subscriptions.get(channel));
      };

      // on disconnect
      socket.on('disconnect', () => this.emit('disconnection', socket));
      /*
      socket.on('message', async (event, callback) => {
        switch (event.type) {
          case Media.MessageNames.GetRouterRtpCapabilities:
            media.onGetRouterRtpCapabilities(event, callback);
            break;
          case Media.MessageNames.CreateProducerTransport:
            media.onCreateProducerTransport(event, callback);
            break;
          case Media.MessageNames.CreateConsumerTranspor: 
            console.log("uwu hit")
            media.onCreateConsumerTransport(event, callback);
            break;
          case Media.MessageNames.ConnectConsumerTransport: 
            media.onConnectProducerTransport(event, callback);
            break;
          case Media.MessageNames.ConnectConsumerTransport: 
            media.onConnectConsumerTransport(event, callback);
            break;
          case Media.MessageNames.Produce:
            media.onProduce(event, callback);
            break;
          case Media.MessageNames.Consume:
            media.onConsume(event, callback);
            break;
          case Media.MessageNames.Resume:
            media.onResume(event, callback);
            break;
          case Media.MessageNames.GetCurrentProducers:
            media.onGetCurrentProducers(event, callback);
            break;
          case Media.MessageNames.PrepareRoom:
            media.onPrepareRoom(event, callback);
            break;
          default:
            break;
        }
      });
      */

      // add router listener
      socket.on('call', (id, method, path, data) => {
        // find routes
        const { params, handlers = [] } = this.__router.find(method, path);

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
            // error
            console.error(e);

            // failed
            result = {
              success : false,
              message : `${e}`,
            };
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

    // info
    this.logger.info('server created');
  }

  /**
   * build database
   */
  async __database() {
    // info
    this.logger.info('db creating');

    // get config
    const db = config.get('db');

    // username and password provider from settings
    const authProvider = new cassandra.auth.PlainTextAuthProvider(db.username, db.password);

    // public hostname for keyspaces
    const contactPoints = db.hosts;

    // setup cassandra client
    this.client = new cassandra.Client({
      contactPoints,
      authProvider,

      keyspace        : db.keyspace,
      localDataCenter : db.region,

      pooling : {
        coreConnectionsPerHost : {
          [cassandra.types.distance.local]  : 3,
          [cassandra.types.distance.remote] : 1
        },
        maxRequestsPerConnection : 2048 * 5,
      },

      queryOptions : {
        consistency : cassandra.types.consistencies.one,
      },

      protocolOptions : {
        port : db.port,
      }
    });

    // build model
    NFTModel.build(this);

    // create on ready event
    this.clientReady = new Promise(async (resolve) => {
      // try/catch
      try {
        await this.client.execute('SELECT * FROM models LIMIT 1', []);
      } catch (e) { console.log(e) }

      // info
      this.logger.info('db ready');

      // resolve
      resolve(true);
    });
    
    // info
    this.logger.info('db created');
  }

  /**
   * builds controllers
   */
  async __controllers() {
    // info
    this.logger.info('controllers creating');

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

      // add app
      this.app[method.toLowerCase()](path, async (req, res, next) => {
        // await
        const data = {
          ...(req.body || {}),
          ...(req.query || {}),
        };
        const { params } = req;

        // resulted
        let resulted = null;

        // do next
        const doNext = () => {
          // resulted
          resulted = true;
          next();
        };

        // try/catch
        try {
          // data/params
          res.data = data;
          res.params = params;

          // await
          const result = await ctrl[property](req, res, doNext);

          // check resulted
          if (resulted) return;

          // check response
          if (!result) return;

          // check response
          if (path.includes('/api/v1')) {
            // done
            res.end(JSON.stringify(result));
          }

          // end
          res.end(result);
        } catch (e) {
          // error
          res.statusCode = 500;
          res.end(e.toString());
        }
      });
    });

    // add catchall
    this.app.get('*', async (req, res) => {
      // return html
      res.end(this.html());
    });

    // set routes
    this.__builtRoutes = allRoutes;

    // info
    this.logger.info('controllers created');
  }

  /**
   * builds controllers
   */
  async __daemons() {
    // info
    this.logger.info('daemons creating');

    // all routes
    let allActions = [];

    // loop controllers
    await Promise.all(Object.keys(daemons).map(async (key) => {
      // build controller
      this.__builtDaemons[key] = new daemons[key](this);

      // await building
      await this.__builtDaemons[key].building;

      // get routes
      allActions.push(...(this.__builtDaemons[key].routes || []));
    }));

    // sort all routes
    allActions = allActions.sort((a, b) => {
      // priority
      const aP = a.priority || 100;
      const bP = b.priority || 100;

      // sort
      if (aP > bP) return 1;
      if (aP < bP) return -1;
      return 0;
    });

    // actions
    let actions = process.env.DAEMON.split(',');

    // check
    if (`${process.env.DAEMON}` === 'true') {
      // all actions
      actions = allActions.map((action) => action.path);
    }

    // loop actions
    for (const action of actions) {
      // find actual action
      const actualRoute = allActions.find((a) => a.path === action);

      // check route
      if (!actualRoute) continue;

      // create actual function
      const actualFn = () => {
        // info
        this.logger.info(`running daemon ${actualRoute.path}`);
        
        // run function
        actualRoute.ctrl[actualRoute.property]();
      };

      // check type
      if (actualRoute.type === 'poll') {
        // set interval
        actualFn();
        setInterval(actualFn, actualRoute.timer);
      } else {
        // drive
        actualFn();
      }
    }

    // info
    this.logger.info('daemons created');
  }

  /**
   * contructs html
   *
   * @param param0 
   */
  html(data = {}) {
    // const
    const { title = 'Moon Social', meta = '' } = data;

    // return html
    return `${this.__html}`.replace('{{TITLE}}', title.includes('Moon Social') ? title : `Moon Social | ${title}`).replace('{{META}}', meta);
  }
}

// export default
const backend = new NFTBackend();
global.backend = backend;

// export default
export default backend;