import config from "../config";
// import mediasoup from 'mediasoup';
import * as mediasoup from 'mediasoup';



import {
  Router,
  Producer,
  Consumer,
  Transport,
  RtpCapabilities,
  Worker
} from "mediasoup/node/lib/types";

interface MessageObject {
  type: string;
  data: any;
  dtlsParameters: any;
  kind: any;
  rtpParameters: any;
  rtpCapabilities: any;
}
interface MessageResponse {
  id: string;

}
interface MessageError {

  errorMsg: string;
  error: Boolean;
}

export default class Message {
  private router: Router;
  private worker: Worker;
  private producerTransport: Transport;
  private consumerTransport: Transport;
  private consumer: Consumer;
  private producer: Producer;
  private io: any;

  constructor(io) {
    this.io = io;
    this.worker = null;
    this.router = null;
    this.producerTransport = null;
    this.consumerTransport = null;
    this.consumer = null;
    this.producer = null;
    this.init()

  }
  async init() {
    this.worker = await mediasoup.createWorker({
      logLevel: config.get('worker.logLevel'),
      logTags: config.get('worker.logTags'),
      rtcMinPort: config.get('worker.rtcMinPort'),
      rtcMaxPort: config.get('worker.rtcMaxPort')
    });

    this.worker.on('died', () => {
      console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', this.worker.pid);
      setTimeout(() => process.exit(1), 2000);
    });

    const mediaCodecs = config.get('router.mediaCodecs');
    this.router = await this.worker.createRouter({
      mediaCodecs
    });

  }
  async createWebRtcTransport(mediasoupRouter: Router) {
    const {
      maxIncomingBitrate,
      initialAvailableOutgoingBitrate,
      listenIps
    } = config.get("webRtcTransport")
    console.log("createTransport Config", maxIncomingBitrate, initialAvailableOutgoingBitrate, listenIps)

    // const mediasoupRouter = getMediasoupWorker().router;

    const transport = await mediasoupRouter.createWebRtcTransport({
      listenIps: listenIps, 
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate,
    });
    if (maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(maxIncomingBitrate);
      } catch (error) {}
    }
    return {
      transport,
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      },
    };
  }
  async createConsumer(producer: Producer, rtpCapabilities: RtpCapabilities) {
    console.log("uwuwuwuw")
    console.log(this.producer.id)
    if (!this.router.canConsume({
        producerId: producer.id,
        rtpCapabilities,
      })) {
          console.log(producer.id)
          console.log(rtpCapabilities)
        console.log(this.router.canConsume({

        producerId: producer.id,
        rtpCapabilities:rtpCapabilities,
          }))
      console.error('can not consume');
      return;
    }
    try {
      this.consumer = await this.consumerTransport.consume({
        producerId: this.producer.id,
        rtpCapabilities,
        paused: this.producer.kind === 'video',
      });
    console.log("uwuwuwuw consume")
    } catch (error) {
      console.error('consume failed', error);
      return;
    }

    if (this.consumer.type === 'simulcast') {
      await this.consumer.setPreferredLayers({
        spatialLayer: 2,
        temporalLayer: 2
      });
    }

    return {
      producerId: this.producer.id,
      id: this.consumer.id,
      kind: this.consumer.kind,
      rtpParameters: this.consumer.rtpParameters,
      type: this.consumer.type,
      producerPaused: this.consumer.producerPaused
    };
  }

  async HandleMessage(event: MessageObject, callback: Function) {
    console.log(event.type)
    switch (event.type) {
      case "getRouterRtpCapabilities":
        this.onGetRouterRtpCapabilities(event, this.io)
        break;
      case "createProducerTransport":
        this.onCreateProducerTransport(event, this.io);
        break;
      case "createConsumerTransport":
        this.onCreateConsumerTransport(event, this.io);
        break;
      case "connectProducerTransport":
        this.onConnectProducerTransport(event, this.io);
        break;
      case "connectConsumerTransport":
        this.onConnectConsumerTransport(event, this.io);
        break;
      case "produce":
        this.onProduce(event, this.io);
        break;
      case "consume":
        this.onConsume(event, this.io);
        break;
      case "resume":
        this.onResume(event, this.io);
        break;
      default:
        break;
    }
  }
  async response(callback: any, room: string, type: string, data: any) {
    const res = {
      type: type,
      data: data
    }

    callback.emit(room, res)
  }


  onGetRouterRtpCapabilities(event: MessageObject, callback: any) {
    this.response(callback, "message", "routerCap", this.router.rtpCapabilities)

  }
  onPrepareRoom(event: MessageObject, callback: Function) {

  }

  async onCreateProducerTransport(event: MessageObject, callback: Function) {
    try {
      const {
        transport,
        params
      } = await this.createWebRtcTransport(this.router)
      this.producerTransport = transport;
      this.response(callback, "message", "pubTransportCreated", params);
    } catch (error) {
      // todo replace error handling
      this.response(callback, "error", "", error);
    }
  }
  async onCreateConsumerTransport(event: MessageObject, callback: Function) {
    try {
      const {
        transport,
        params
      } = await this.createWebRtcTransport(this.router)
      this.consumerTransport = transport;
      this.response(callback,"message","subTransportCreated", params);
    } catch (error) {
      callback("error", error);
    }
  }
  async onConnectProducerTransport(event: MessageObject, callback: Function) {
    await this.producerTransport.connect({
      dtlsParameters: event.dtlsParameters
    });
    this.response(callback, "message", "pubConnected", "producer connected");
  }

  async onConnectConsumerTransport(event: MessageObject, callback: Function) {
    await this.consumerTransport.connect({
      dtlsParameters: event.dtlsParameters
    });
    this.response(callback,"message", "subConnected", "consumer connected")
  }
  async onProduce(event: MessageObject, callback: any) {
    const {
      kind,
      rtpParameters
    } = event;
    this.producer = await this.producerTransport.produce({
      kind,
      rtpParameters
    });
    let res: MessageResponse = {
      id: this.producer.id
    }
    this.response(callback,"message","published", res)
    this.response(callback, "message", "hasPublisher", "new user");

    // send(ws, "published", res);
  }
  async onConsume(event: MessageObject, callback: Function) {
      console.log(event)
      const res = await this.createConsumer(this.producer, event.rtpCapabilities);
      console.log("onconsumer", res)
      this.response(callback,"message","subscribed", res)

  }
  async onResume(event: MessageObject, callback: Function) {
    await this.consumer.resume();
    this.response(callback,"message","resumed", "resumed")
  }

}
