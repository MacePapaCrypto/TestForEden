
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
import config from './config';
import NFTModel from './base/model';
import controllers from './controllers';
import  Media from './base/media';

import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
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
    await this.__logger();
    await this.__server();
    await this.__database();
    await this.__controllers();
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

    // const pubClient = createClient({ url: "redis://127.0.0.1:6379" });
    // const subClient = pubClient.duplicate();

    // Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    //   this.io.adapter(createAdapter(pubClient, subClient));
    // });


    // on connection
    this.io.on('connection', async (socket) => {
      // on connection
      this.emit('connection', socket);
      
      // set session id
      socket.ssid = socket.handshake.query.ssid;

      // set initial acls
      socket.acl = ['nouser'];
      

      let media = new Media.Media(socket)
      // on disconnect
      socket.on('disconnect', () => this.emit('disconnection', socket));
      socket.on('message', async (event, callback) => {
          console.log(event);
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
              message : `${e}`,
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
    });

    // set routes
    this.__builtRoutes = allRoutes;

    // info
    this.logger.info('controllers created');
  }
}

// export default
const backend = new NFTBackend();

// export default
export default backend;