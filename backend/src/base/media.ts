import config from "../config";
// import mediasoup from 'mediasoup';
import * as mediasoup from 'mediasoup';

import {
  Router,
  Producer,
  Consumer,
  Transport,
  RtpCapabilities,
  Worker,
  DtlsParameters,
  RtpParameters,
  ConsumerType,
  IceParameters,
  IceCandidate,
  MediaKind,
  WebRtcTransportOptions,
  WorkerLogLevel,
  WorkerLogTag,
  RtpCodecCapability
} from "mediasoup/node/lib/types";
import { Socket } from "socket.io";

interface MessageObject {
  type: string;
  data: any;
  roomName: string;
  remoteId: string;
  dtlsParameters: DtlsParameters;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  rtpCapabilities: RtpCapabilities;
}
interface MessageResponse {
  id ? : string;
  type?: string;
  data?: any;
}
interface MessageError {
  errorMsg: string;
  error: Boolean;
}
interface ConsumerTransportParams {
  producerId: string;
  id: string;
  kind: string;
  rtpParameters: RtpParameters;
  type: ConsumerType;
  producerPaused: Boolean;
}

interface ConsumerTransportResponse {
  consumer: Consumer;
  params: ConsumerTransportParams;
}
interface TransportParams {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: Array<IceCandidate>; 
  dtlsParameters: DtlsParameters;
}
interface TransportResponse {
  transport: Transport;
  params: TransportParams;
}

class Room {
  // TODO GET/SET/DELETE methods should be replaced by redis/db store 
  name: String;
  router: Router;
  producerTransports: Map<string, Transport>;
  videoProducers: Map<string, Producer>;
  audioProducers: Map< string, Producer>;

  consumerTransports: Map<string, Transport>;
  videoConsumers: Map<string, Map<string, Consumer>>;
  audioConsumers: Map<string, Map<string, Consumer>>;

    constructor(name: string) {
      this.name = name;
      this.router = null;
      this.producerTransports = new Map<string, Transport>(null);
      this.videoProducers = new Map<string, Producer>(null);
      this.audioProducers = new Map<string, Producer>(null);

      this.consumerTransports = new Map<string, Transport>(null);
      this.videoConsumers = new Map<string, Map<string,Consumer>>(null);
      this.audioConsumers = new Map<string, Map<string, Consumer>>(null);

    }
  // GET/SET/Remove ProducerTransport
  getProducerTransport(id: string): Transport {
    if (!this.producerTransports.has(id)) {
      throw new Error("Producer Transport does not exist");
    }
    return this.producerTransports.get(id);
  }
  addProducerTransport(id: string, producer: Transport) {
    if (this.producerTransports.has(id)) {
      throw new Error("Existing Room name");
    }
    return this.producerTransports.set(id, producer);

  }
  removeProducerTransport(id: string): Boolean {
    if (!this.producerTransports.has(id)) {
      throw new Error("Room does not exist");
    }
    return this.producerTransports.delete(id);
  }

  // GET/SET/Remove Video Producers 
  getVideoProducer(id: string): Producer {
    if (!this.videoProducers.has(id)) {
      throw new Error("Video Producer does not exist");
    }
    return this.videoProducers.get(id);

  }
  addVideoProducer(id: string, producer: Producer) {
    if (this.videoProducers.has(id)) {
      throw new Error("Existing Room name");
    }
    return this.videoProducers.set(id, producer);
  }
  removeVideoProducer(id: string): Boolean {
    if (!this.videoProducers.has(id)) {
      throw new Error("Video Producer does not exist");
    }
    return this.videoProducers.delete(id);
  }

  // GET/SET/Remove Audio Producers 
  getAudioProducer(id: string): Producer {
    if (!this.audioProducers.has(id)) {
      throw new Error("Audio Producer does not exist");
    }
    return this.audioProducers.get(id);

  }
  addAudioProducer(id: string, producer: Producer) {
    if (this.audioProducers.has(id)) {
      throw new Error("Existing Room name");
    }
    return this.audioProducers.set(id, producer);
  }
  removeAudioProducer(id: string): Boolean {
    if (!this.audioProducers.has(id)) {
      throw new Error("Audio Producer does not exist");
    }
    return this.audioProducers.delete(id);
  }

  // GET/SET/Remove Audio/Video Producer 
  getProducer(id: string, kind: string): Producer {
    if (kind === "video") {
      return this.getVideoProducer(id);
    } else if (kind === "audio") {
      return this.getAudioProducer(id);
    } else {
      throw new Error("Invalid producer kind")
    }
  }
  addProducer(id: string, producer: Producer, kind: string) {
    if (kind === "video") {
      return this.addVideoProducer(id, producer);
    } else if (kind === "audio") {
      return this.addAudioProducer(id, producer);
    } else {
      throw new Error("Invalid producer kind")
    }
  }
  removeProducer(id: string, kind: string): Boolean {
    if (kind === "video") {
      return this.removeVideoProducer(id);
    } else if (kind === "audio") {
      return this.removeAudioProducer(id);
    } else {
      throw new Error("Invalid producer kind")
    }
  }

  // GET Producer remoteids
  getProducerRemoteIds(clientId: string, kind: string): Array <string> {
    let remoteIds: Array < string > = new Array < string > (null);
    if (kind === "video") {
      this.videoProducers.forEach((producer: Producer, key: string) => {
        if (key !== clientId) {
          remoteIds.push(key);
        }
      });
    } else if (kind === "audio") {
      this.audioProducers.forEach((producer: Producer, key: string) => {
        if (key !== clientId) {
          remoteIds.push(key);
        }
      });
    } else {
      throw new Error("Invalid producer kind")
    }
    return remoteIds;
  }

  // GET/SET/Remove Consumer Transport 
  getConsumerTransport(id: string): Transport {
    if (!this.consumerTransports.has(id)) {
      throw new Error("Consumer Transport does not exist");
    }
    return this.consumerTransports.get(id);
  }
  addConsumerTransport(id: string, consumer: Transport) {
    if (this.consumerTransports.has(id)) {
      throw new Error("Consumer Transport does not exist");
    }
    return this.consumerTransports.set(id, consumer);

  }
  removeConsumerTransport(id: string): Boolean {
    if (!this.consumerTransports.has(id)) {
      throw new Error("Consumer Transport does not exist");
    }
    return this.consumerTransports.delete(id);
  }
  getVideoConsumerMap(id: string): Map<string, Consumer> {
    if (!this.videoConsumers.has(id)) {
      throw new Error("Video Consumer does not exist");
    }
    return this.videoConsumers.get(id);
  }

  getAudioConsumerMap(id: string): Map<string,Consumer> {
    if (!this.audioConsumers.has(id)) {
      throw new Error("Audio Consumer does not exist");
    }
    return this.audioConsumers.get(id)
  }

  getConsumerMap(id: string, kind: string) : Map<string, Consumer> {
    if (kind === 'video') {
      return this.getVideoConsumerMap(id);
    } else if (kind === 'audio') {
      return this.getAudioConsumerMap(id);
    } else {
      throw new Error("Consumer does not exist")
    }
  }

  addVideoConsumerMap(id: string, consumer: Map<string, Consumer>) {
    if (this.videoConsumers.has(id)) {
      throw new Error("Error adding video consumer");
    }
    return this.videoConsumers.set(id, consumer);
  }
  addAudioConsumerMap(id: string, consumer: Map<string, Consumer>) {
    if (this.audioConsumers.has(id)) {
      throw new Error("Error adding audio consumer");
    }
    return this.audioConsumers.set(id, consumer);
  }
  removeVideoConsumerMap(id: string): Boolean {
    if (!this.videoConsumers.has(id)) {
      throw new Error("Video Consumer does not exist");
    }
    return this.videoConsumers.delete(id);
  }
  removeAudioConsumerMap(id: string): Boolean {
    if (!this.audioConsumers.has(id)) {
      throw new Error("Audio Consumer does not exist");
    }
    return this.audioConsumers.delete(id);
  }


  addConsumerMap(id: string, set: Map<string, Consumer>, kind: string) {
    if (kind === 'video') {
      return this.addVideoConsumerMap(id, set);
    } else if (kind === 'audio') {
      return this.addAudioConsumerMap(id, set);
    } else {
      throw new Error("Error adding consumer set")
    }
  }
  removeConsumerMap(id: string, kind: string): Boolean {
    if (kind === 'video') {
      return this.removeVideoConsumerMap(id);
    } else if (kind === 'audio') {
      return this.removeAudioConsumerMap(id);
    } else {
      throw new Error("Error removing consumer set")
    }
  }
  removeConsumerMapDeep(id: string): Boolean {
    if (!this.videoConsumers.has(id)) {
      throw new Error("Video Consumer does not exist");
    }
    this.getVideoConsumerMap(id).forEach((consumer: Consumer, key: string) => {
      consumer.close();
      this.removeVideoConsumerMap(key);
    });
    this.getAudioConsumerMap(id).forEach((consumer: Consumer, key: string) => {
      consumer.close();
      this.removeAudioConsumerMap(key);
    });
    return true;
  }

  getConsumer(id: string, remoteId: string, kind: string): Consumer {
    if (!this.getConsumerMap(id, kind).has(remoteId)) {
      throw new Error("consumer does not exist");
    }
    return this.getConsumerMap(id, kind).get(remoteId);
  }
  addConsumer(id: string, remoteId: string, consumer: Consumer, kind: string) {
    if (this.getConsumerMap(id, kind).has(remoteId)) {
      return this.getConsumerMap(id, kind).set(remoteId, consumer);
    } else {
      const set = new Map<string, Consumer>();
      set.set(remoteId, consumer);
      return this.addConsumerMap(id, set, kind);
    }
  }
  removeConsumer(id: string, remoteId: string, kind: string): Boolean {
    if (!this.getConsumerMap(id, kind).has(remoteId)) {
      throw new Error("consumer does not exist");
    }
    return this.getConsumerMap(id, kind).delete(remoteId);
  }
  disconnect(id: string) {
    this.removeConsumerMapDeep(id);
    const transport = this.getConsumerTransport(id);
    if (transport) {
      transport.close();
      this.removeConsumerTransport(id);
    }
    const videoProducer = this.getVideoProducer(id);
    if (videoProducer) {
      videoProducer.close();
      this.removeVideoProducer(id);
    }
    const audioProducer = this.getAudioProducer(id);
    if (audioProducer) {
      audioProducer.close();
      this.removeAudioProducer(id);
    }
    const producerTransport = this.getProducerTransport(id);
    if (producerTransport) {
      producerTransport.close();
      this.removeProducerTransport(id);
    }
  }

  // SET router
  setRouter(router: Router) {
    this.router = router;
  }
  getRouter(): Router {
    return this.router;
  }
}

class Rooms {
  // TODO GET/SET/DELETE methods should be replaced by redis/db store 
  rooms: Map <string, Room> ;
  defaultRoom: string;
  constructor() {
    this.rooms = new Map <string, Room>(null);
    this.defaultRoom = "_default_room"
  }
  getRoom(name: string = this.defaultRoom): Room {
    if (!this.rooms.has(name)) {
      throw new Error("Room does not exist");
    }
    return this.rooms.get(name);
  }
  removeRoom(name: string = this.defaultRoom): Boolean {
    if (!this.rooms.has(name)) {
      throw new Error("Room does not exist");
    }
    return this.rooms.delete(name);
  }
  addRoom(name: string = this.defaultRoom): Room {
    if (this.rooms.has(name)) {
      throw new Error("Existing Room name");
    }
    let room = new Room(name)
    this.rooms.set(name, room);
    return room
  }

  getRoomProducerTransport(roomName: string = this.defaultRoom, id: string): Transport {
    return this.getRoom(roomName).getProducerTransport(id);
  }
  addRoomProducerTransport(roomName: string = this.defaultRoom, id: string, producer: Transport) {
    return this.getRoom(roomName).addProducerTransport(id, producer);
  }
  removeRoomProducerTransport(roomName: string = this.defaultRoom, id: string) {
    return this.getRoom(roomName).removeProducerTransport(id);
  }
  getRoomProducerRemoteIds(roomName: string = this.defaultRoom, clientId: string, kind: string): Array < string > {
    return this.getRoom(roomName).getProducerRemoteIds(clientId, kind);
  }
  getRoomProducer(roomName: string = this.defaultRoom, id: string, kind: string): Producer {
    return this.getRoom(roomName).getProducer(id, kind);
  }
  addRoomProducer(roomName: string = this.defaultRoom, id: string, producer: Producer, kind: string) {
    return this.getRoom(roomName).addProducer(id, producer, kind);
  }
  removeRoomProducer(roomName: string = this.defaultRoom, id: string, kind: string): Boolean {
    return this.getRoom(roomName).removeProducer(id, kind);
  }
  getRoomConsumerTransport(roomName: string = this.defaultRoom, id: string): Transport {
    return this.getRoom(roomName).getConsumerTransport(id);
  }
  addRoomConsumerTransport(roomName: string = this.defaultRoom, id: string, consumer: Transport) {
    return this.getRoom(roomName).addConsumerTransport(id, consumer);
  }
  removeRoomConsumerTransport(roomName: string = this.defaultRoom, id: string): Boolean {
    return this.getRoom(roomName).removeConsumerTransport(id);
  }
  getRoomConsumer(roomName: string = this.defaultRoom, id: string, remoteId: string, kind: string): Consumer {
    return this.getRoom(roomName).getConsumer(id, remoteId, kind);
  }
  addRoomConsumer(roomName: string = this.defaultRoom, id: string, remoteId: string, consumer: Consumer, kind: string) {
    return this.getRoom(roomName).addConsumer(id, remoteId, consumer, kind);
  }
  removeRoomConsumer(roomName: string = this.defaultRoom, id: string, remoteId: string, kind: string): Boolean {
    return this.getRoom(roomName).removeConsumer(id, remoteId, kind);
  }
  getRoomConsumerMap(roomName: string = this.defaultRoom, id: string, kind: string): Map < string, Consumer > {
    return this.getRoom(roomName).getConsumerMap(id, kind);
  }
  addRoomConsumerMap(roomName: string = this.defaultRoom, id: string, set: Map < string, Consumer >, kind: string) {
    return this.getRoom(roomName).addConsumerMap(id, set, kind);
  }
  removeRoomConsumerMap(roomName: string = this.defaultRoom, id: string, kind: string): Boolean {
    return this.getRoom(roomName).removeConsumerMap(id, kind);
  }
  removeRoomConsumerSetDeep(roomName: string = this.defaultRoom, id: string): Boolean {
    return this.getRoom(roomName).removeConsumerMapDeep(id);
  }
  addRoomVideoConsumerMap(roomName: string = this.defaultRoom, id: string, set: Map < string, Consumer >) {
    return this.getRoom(roomName).addVideoConsumerMap(id, set);
  }
  removeRoomVideoConsumerMap(roomName: string = this.defaultRoom, id: string): Boolean {
    return this.getRoom(roomName).removeVideoConsumerMap(id);
  }
  getRoomVideoConsumerMap(roomName: string = this.defaultRoom, id: string): Map < string, Consumer > {
    return this.getRoom(roomName).getVideoConsumerMap(id);
  }
  addRoomAudioConsumerMap(roomName: string = this.defaultRoom, id: string, set: Map < string, Consumer >) {
    return this.getRoom(roomName).addAudioConsumerMap(id, set);
  }
  removeRoomAudioConsumerMap(roomName: string = this.defaultRoom, id: string): Boolean {
    return this.getRoom(roomName).removeAudioConsumerMap(id);
  }
  getRoomRouter(roomName: string = this.defaultRoom): Router {
    return this.getRoom(roomName).getRouter();
  }
  setRoomRouter(roomName: string = this.defaultRoom, router: Router) {
    return this.getRoom(roomName).setRouter(router);
  }
  disconnectRoom(roomName: string = this.defaultRoom, id: string) {
    return this.getRoom(roomName).disconnect(id);
  }
}
export default class Media {
  worker: Worker;
  io:  any;
  rooms: Rooms;

  constructor(io) {
    this.io = io;
    this.worker = null;
    this.rooms = new Rooms();
    this.init()
    this.io.on('disconnect', () => {
      const roomName = this.getSocketRoomName();
      const id = this.getSocketId();
      this.rooms.disconnectRoom(roomName, id);
      this.io.leave(roomName);
    })

  }
  async init() {
    await this.createWorker();
    await this.setupRoom(null);
  }

  async setupRoom(roomName: string) {
    const room = this.rooms.addRoom(roomName);
    const mediaCodecs = config.get('router.mediaCodecs') as Array<RtpCodecCapability>;
    let router = await this.worker.createRouter({
      mediaCodecs
    });
    // router.roomname = roomName;
    router.observer.on('close', () => {})
    router.observer.on('newtransport', (transport) => {})

    this.rooms.setRoomRouter(roomName, router);
    return room

  }

  async createWorker() {
    this.worker = await mediasoup.createWorker({
      logLevel: config.get('worker.logLevel') as WorkerLogLevel,
      logTags: config.get('worker.logTags') as Array<WorkerLogTag>,
      rtcMinPort: config.get('worker.rtcMinPort') as number,
      rtcMaxPort: config.get('worker.rtcMaxPort') as number,
    });

    this.worker.on('died', () => {
      console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', this.worker.pid);
      setTimeout(() => process.exit(1), 2000);
    });
  }
  async createWebRtcTransport(roomName ? : string): Promise<TransportResponse> {
    const router = this.rooms.getRoom(roomName).getRouter();

    const webRtcTransport: WebRtcTransportOptions = config.get("webRtcTransport") as WebRtcTransportOptions;
    const transport = await router.createWebRtcTransport(webRtcTransport);
    const response: TransportResponse =  {
      transport,
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      },
    };
    return response;
  }
  async createConsumer(roomName: string, transport: Transport, producer: Producer, rtpCapabilities: RtpCapabilities): Promise<ConsumerTransportResponse>{
    const router = this.rooms.getRoom(roomName).getRouter();
    let consumer: Consumer = null;
    if (!router.canConsume({
        producerId: producer.id,
        rtpCapabilities,
      })) {
      throw new Error("can not consume");
    }
    try {
      consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities,
        paused: producer.kind === 'video',
      });
    } catch (error) {
      throw new Error("can not consume")
    }

    if (consumer.type === 'simulcast') {
      await consumer.setPreferredLayers({
        spatialLayer: 2,
        temporalLayer: 2
      });
    }

    let response: ConsumerTransportResponse = {
      consumer: consumer,
      params: {
        producerId: producer.id,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused

      }
    };
    return response;
  }
  setSocketRoomName(roomName: string) {
    this.io.roomName = roomName;
  }
  getSocketRoomName(): string {
    return this.io.roomName;
  }
  getSocketId(): string {
    return this.io.ssid;
  }

  sendResponse(room: string = "message", message: MessageResponse) {
    this.io.emit(room,  message);
  }
  errorResponse(room: string = "message", message: MessageError) {
    this.io.emit(room, message);
  }

  callBack(message: MessageResponse, callback: Function) {
    callback(null, message);
  }

  async onGetRouterRtpCapabilities(event: MessageObject, callback: Function) {
    try {

      const router = this.rooms.getRoomRouter("_default_room");
      if (router) {
        const res: MessageResponse = {
          "type": "routerCap",
          data: router.rtpCapabilities,
        }
        this.callBack(res, callback);
      } else {
        // handle error
        const errorMsg: MessageError = {
          errorMsg: "router not found",
          error: true
        }
          
        this.errorResponse("error", errorMsg)
      }
    } catch(error) {
        const errorMsg: MessageError = {
          errorMsg: error.message, 
          error: true
        }
        this.errorResponse("error", errorMsg)
          
    }

  }
  async onPrepareRoom(event: MessageObject, callback: Function) {
    try {
      this.rooms.addRoom(event.roomName);
      this.setupRoom(event.roomName);
      this.setSocketRoomName(event.roomName);

    } catch (error) {
      const errorMsg: MessageError = {
        errorMsg: "room exists", 
        error: true
      }
      this.errorResponse("error", errorMsg)
        
    }

  }

  async onCreateProducerTransport(event: MessageObject, callback: Function) {
    try {
      const roomName = this.getSocketRoomName();
      const {
        transport,
        params
      } = await this.createWebRtcTransport(roomName);
      transport.observer.on('close', () => {
        const id =this.getSocketId();
        const videoProducer = this.rooms.getRoomProducer(roomName, id, 'video');
        if (videoProducer) {
          videoProducer.close();
          this.rooms.removeRoomProducer(roomName, id, 'video');
        }
        const audioProducer = this.rooms.getRoomProducer(roomName, id, 'audio');
        if (audioProducer) {
          audioProducer.close();
          this.rooms.removeRoomProducer(roomName, id, 'audio');
        }
        this.rooms.removeRoomProducerTransport(roomName, id);
      });
      this.rooms.getRoom().addProducerTransport(roomName, transport)
      const res: MessageResponse = {
        "type": "pubTransportCreated",
        data: params 
      }
      this.callBack(res, callback);
    } catch (error) {
      const errorMsg: MessageError = {
        errorMsg: error.message, 
        error: true
      }
      this.errorResponse("error", errorMsg)

    }
  }
  async onCreateConsumerTransport(event: MessageObject, callback: Function) {
    try {
      const roomName = this.getSocketRoomName();
      const id = this.getSocketId();
      const {
        transport,
        params
      } = await this.createWebRtcTransport(roomName)
      transport.observer.on('close', () => {
        const id = this.getSocketId();
        this.rooms.removeRoomConsumerTransport(roomName, id);
        this.rooms.removeRoomConsumerTransport(roomName, id);
      })
      this.rooms.addRoomConsumerTransport(roomName,id, transport);
      const res: MessageResponse = {
        "type": "subTransportCreated",
        data: params, 
      }
      this.callBack(res, callback);
    } catch(error) {
      const errorMsg: MessageError = {
        errorMsg: error.message, 
        error: true
      }
      this.errorResponse("error", errorMsg)
    }

  }
  async onConnectProducerTransport(event: MessageObject, callback: Function) {
  try {
      const roomName = this.getSocketRoomName();
      const id = this.getSocketId();
      let transport: Transport = this.rooms.getRoomProducerTransport(roomName, id);

      await transport.connect({
        dtlsParameters: event.dtlsParameters
      });
      const res: MessageResponse = {
        "type": "pubConnected",
      }
      this.callBack(res, callback);
  } catch(error) {
      const errorMsg: MessageError = {
        errorMsg: error.message, 
        error: true
      }
      this.errorResponse("error", errorMsg)

  }
}

  async onConnectConsumerTransport(event: MessageObject, callback: Function) {
    try {
      const roomName = this.getSocketRoomName();
      const id = this.getSocketId();
      let transport: Transport = this.rooms.getRoomConsumerTransport(roomName, id);
      if (!transport) {
        // error handle
        throw new Error("transport not found");
      }

      await transport.connect({
        dtlsParameters: event.dtlsParameters
      });

      const res: MessageResponse = {
        "type": "subConnected",
      }
      this.callBack(res, callback);
    } catch(error) {
      const errorMsg: MessageError = {
        errorMsg: error.message, 
        error: true
      }
      this.errorResponse("error", errorMsg)
    }
  }
  async onProduce(event: MessageObject, callback: Function) {
    try {
      const roomName = this.getSocketRoomName();
      const id = this.getSocketId();
      const {
        kind,
        rtpParameters
      } = event;
      const transport: Transport = this.rooms.getRoomProducerTransport(roomName, id);
      if (!transport) {
        // error handle
        throw new Error("transport not found");
      }
      let producer = await transport.produce({
        kind,
        rtpParameters
      });
      this.rooms.addRoomProducer(roomName,id, producer, kind);
      let res: MessageResponse = {
        id: producer.id
      }
      // this.response("message", "published", res)
      // this.response("message", "hasPublisher", "new user");
      // 

      // inform clients about new producer
      if (roomName) {
        // broadcast to room
      //   socket.broadcast.to(roomName).emit('newProducer', { socketId: id, producerId: producer.id, kind: producer.kind });
      } else {
        // emit new producer 
      //   socket.broadcast.emit('newProducer', { socketId: id, producerId: producer.id, kind: producer.kind });
      }

    } catch(error) {
      const errorMsg: MessageError = {
        errorMsg: error.message, 
        error: true
      }
      this.errorResponse("error", errorMsg)
    }
  }
  async onConsume(event: MessageObject, callback: Function) {
    try {
      const roomName = this.getSocketRoomName();
      const id = this.getSocketId();
      const kind = event.type
      const remoteId = event.remoteId;
      const rtpCapabilities = event.rtpCapabilities;
      const transport = this.rooms.getRoomConsumerTransport(roomName, id);
      if (!transport) {
        throw new Error("Error transport does not exist")
      }
      const producer = this.rooms.getRoomProducer(roomName, id, kind);
      if (!producer) {
        throw new Error("Error Producer does not exist")
      }
      const {consumer, params} = await this.createConsumer(roomName, transport, producer, rtpCapabilities);
      consumer.observer.on('close', () => {
        //handle consumer dc
      })
      consumer.observer.on('producerclose', () => {
        const roomName = this.getSocketRoomName()
        consumer.close();
        this.rooms.removeRoomConsumer(roomName, id, remoteId, kind);
        let res: MessageResponse = {
          "type": "pubClosed",
          data: { localId: id, remoteId: remoteId, kind: kind },
        }
        this.sendResponse(roomName, res);
      })
      this.rooms.addRoomConsumer(roomName, id, remoteId, consumer, kind);
      const response: ConsumerTransportResponse = {
          consumer: consumer,
          params: params,
      }
      const res: MessageResponse = {
        "type": "subscribed",
        data: response,
      }
      this.callBack(res, callback);

  } catch(error) {
      const errorMsg: MessageError = {
        errorMsg: error.message, 
        error: true
      }
      this.errorResponse("error", errorMsg)
  }

  }
  async onResume(event: MessageObject, callback: Function) {
    try {
      const roomName = this.getSocketRoomName();
      const id = this.getSocketId();
      const remoteId = event.remoteId;
      const kind = event.kind;
      let consumer: Consumer = this.rooms.getRoomConsumer(roomName, id, remoteId, kind)
      if (!consumer) {
        throw new Error("Error no consumer");
      }
      await consumer.resume();
      const res: MessageResponse = {
        "type": "resumed",
      }
      this.callBack(res, callback);

    } catch(error) {
      const errorMsg: MessageError = {
        errorMsg: error.message, 
        error: true
      }
      this.errorResponse("error", errorMsg)
    }
  }

}
