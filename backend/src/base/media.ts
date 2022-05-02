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

interface MessageObject {
  type: MessageNames;
  data: any;
  roomName: string;
  remoteId: string;
  dtlsParameters: DtlsParameters;
  forceTcp: Boolean;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  rtpCapabilities: RtpCapabilities;
  clientId: string;
}
interface MessageResponse {
  id ? : string;
  type?: MessageResponsesTypes;
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

class MediaSoup {
  constructor() {

  }

}
class Room {
  // TODO GET/SET/DELETE methods should be replaced by redis/db store 
  name: String;
  router: Router;
  worker: Worker;
  io: any;
  producerTransports: Map<string, Transport>;
  videoProducers: Map<string, Producer>;
  audioProducers: Map< string, Producer>;

  consumerTransports: Map<string, Transport>;
  videoConsumers: Map<string, Map<string, Consumer>>;
  audioConsumers: Map<string, Map<string, Consumer>>;

    constructor(name: string, worker: Worker, io: any) {
      this.name = name;
      this.worker = worker;
      this.io = io
      const mediaCodecs = config.get('router.mediaCodecs') as Array<RtpCodecCapability>;
      this.worker.createRouter({
        mediaCodecs
      }).then((router) => {

        this.router = router;
        router.observer.on('close', () => {})
        router.observer.on('newtransport', (transport) => {})
      });
      // router.roomname = roomName;

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
    console.log(this.producerTransports);
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
    console.log(kind);
    console.log(this.videoProducers);
    console.log(this.audioProducers);
    if (kind === "video") {
      this.videoProducers.forEach((producer: Producer, key: string) => {
        console.log(key);
        console.log(clientId);
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
  getWorker(): Worker {
    return this.worker;
  }
  setWorker(worker: Worker) {
    this.worker = worker;
  }
}

class Rooms {
  // TODO GET/SET/DELETE methods should be replaced by redis/db store 
  rooms: Map <string, Room> ;
  defaultRoom: string;
  constructor() {
    this.rooms = new Map <string, Room>(null);
  }
  getRoom(name: string = "_default_room"): Room {
      console.log(name);
    if (!this.rooms.has(name)) {
      throw new Error("Room does not exist");
    }
    return this.rooms.get(name);
  }
  removeRoom(name: string = "_default_room"): Boolean {
    if (!this.rooms.has(name)) {
      throw new Error("Room does not exist");
    }
    return this.rooms.delete(name);
  }
  addRoom(name: string = "_default_room", worker: Worker, io: any): Room {
    if (this.rooms.has(name)) {
      throw new Error("Existing Room name");
    }
    let room = new Room(name, worker, io)
    this.rooms.set(name, room);
    return room
  }

  getRoomProducerTransport(roomName: string = "_default_room", id: string): Transport {
    return this.getRoom(roomName).getProducerTransport(id);
  }
  addRoomProducerTransport(roomName: string = "_default_room", id: string, producer: Transport) {
    return this.getRoom(roomName).addProducerTransport(id, producer);
  }
  removeRoomProducerTransport(roomName: string = "_default_room", id: string) {
    return this.getRoom(roomName).removeProducerTransport(id);
  }
  getRoomProducerRemoteIds(roomName: string = "_default_room", clientId: string, kind: string): Array < string > {
    return this.getRoom(roomName).getProducerRemoteIds(clientId, kind);
  }
  getRoomProducer(roomName: string = "_default_room", id: string, kind: string): Producer {
    return this.getRoom(roomName).getProducer(id, kind);
  }
  addRoomProducer(roomName: string = "_default_room", id: string, producer: Producer, kind: string) {
    return this.getRoom(roomName).addProducer(id, producer, kind);
  }
  removeRoomProducer(roomName: string = "_default_room", id: string, kind: string): Boolean {
    return this.getRoom(roomName).removeProducer(id, kind);
  }
  getRoomConsumerTransport(roomName: string = "_default_room", id: string): Transport {
    return this.getRoom(roomName).getConsumerTransport(id);
  }
  addRoomConsumerTransport(roomName: string = "_default_room", id: string, consumer: Transport) {
    return this.getRoom(roomName).addConsumerTransport(id, consumer);
  }
  removeRoomConsumerTransport(roomName: string = "_default_room", id: string): Boolean {
    return this.getRoom(roomName).removeConsumerTransport(id);
  }
  getRoomConsumer(roomName: string = "_default_room", id: string, remoteId: string, kind: string): Consumer {
    return this.getRoom(roomName).getConsumer(id, remoteId, kind);
  }
  addRoomConsumer(roomName: string = "_default_room", id: string, remoteId: string, consumer: Consumer, kind: string) {
    return this.getRoom(roomName).addConsumer(id, remoteId, consumer, kind);
  }
  removeRoomConsumer(roomName: string = "_default_room", id: string, remoteId: string, kind: string): Boolean {
    return this.getRoom(roomName).removeConsumer(id, remoteId, kind);
  }
  getRoomConsumerMap(roomName: string = "_default_room", id: string, kind: string): Map < string, Consumer > {
    return this.getRoom(roomName).getConsumerMap(id, kind);
  }
  addRoomConsumerMap(roomName: string = "_default_room", id: string, set: Map < string, Consumer >, kind: string) {
    return this.getRoom(roomName).addConsumerMap(id, set, kind);
  }
  removeRoomConsumerMap(roomName: string = "_default_room", id: string, kind: string): Boolean {
    return this.getRoom(roomName).removeConsumerMap(id, kind);
  }
  removeRoomConsumerSetDeep(roomName: string = "_default_room", id: string): Boolean {
    return this.getRoom(roomName).removeConsumerMapDeep(id);
  }
  addRoomVideoConsumerMap(roomName: string = "_default_room", id: string, set: Map < string, Consumer >) {
    return this.getRoom(roomName).addVideoConsumerMap(id, set);
  }
  removeRoomVideoConsumerMap(roomName: string = "_default_room", id: string): Boolean {
    return this.getRoom(roomName).removeVideoConsumerMap(id);
  }
  getRoomVideoConsumerMap(roomName: string = "_default_room", id: string): Map < string, Consumer > {
    return this.getRoom(roomName).getVideoConsumerMap(id);
  }
  addRoomAudioConsumerMap(roomName: string = "_default_room", id: string, set: Map < string, Consumer >) {
    return this.getRoom(roomName).addAudioConsumerMap(id, set);
  }
  removeRoomAudioConsumerMap(roomName: string = "_default_room", id: string): Boolean {
    return this.getRoom(roomName).removeAudioConsumerMap(id);
  }
  getRoomRouter(roomName: string = "_default_room"): Router {
    return this.getRoom(roomName).getRouter();
  }
  setRoomRouter(roomName: string = "_default_room", router: Router) {
    return this.getRoom(roomName).setRouter(router);
  }
  disconnectRoom(roomName: string = "_default_room", id: string) {
    return this.getRoom(roomName).disconnect(id);
  }
}

enum MessageNames {
  GetRouterRtpCapabilities = "getRouterRtpCapabilities",
  CreateProducerTransport = "createProducerTransport",
  CreateConsumerTranspor = "createConsumerTransport",
  ConnectProducerTransport = "connectProducerTransport",
  ConnectConsumerTransport = "connectConsumerTransport",
  Produce = "produce",
  Consume = "consume",
  Resume= "resume",
  PrepareRoom = "prepareRoom",
  GetCurrentProducers = "getCurrentProducers",


}
enum MessageResponsesTypes {
  RouterCap = "routerCap",
  PubTransportCreated = "pubTransportCreated",
  SubTransportCreated = "subTransportCreated",
  PubConnected = "pubConnected",
  SubConnected = "subConnected",
  PubClosed = "pubClosed",
  Published = "published",
  Subscribed = "subscribed",
  Resumed = "resumed",
  CurrentProducers = "currentProducers",
  RoomCreated = "roomCreated"
}
class Media {
  io: any;
  workers: Array<Worker>;
  nextMediasoupWorkerIdx: number;
  rooms: Rooms;

  constructor(io) {
    this.io = io;
    this.workers = new Array<Worker>(null);
    this.rooms = new Rooms();
    this.nextMediasoupWorkerIdx = 0;
    this.init()
    this.io.on('disconnect', () => {
      try {

        const roomName = this.getSocketRoomName();
        const id = this.getSocketId();
        this.rooms.disconnectRoom(roomName, id);
        this.io.leave(roomName);
      } catch (e) {
        console.log(e)
      }
    })

  }
  async init() {
    await this.createWorkers();
    await this.setupRoom("_default_room");
  }
  async createWorkers()  {
    const numWorkers = config.get('mediasoup.workers') as number;

    for (let i = 0; i < numWorkers; i++) {
      let worker = await mediasoup.createWorker({
        logLevel: config.get('worker.logLevel') as WorkerLogLevel,
        logTags: config.get('worker.logTags') as Array<WorkerLogTag>,
        rtcMinPort: config.get('worker.rtcMinPort') as number,
        rtcMaxPort: config.get('worker.rtcMaxPort') as number,
      });

      worker.on('died', () => {
        console.error(
          'mediasoup worker died, exiting in 2 seconds... [pid:%d]',
          worker.pid
        );
        setTimeout(() => process.exit(1), 2000);
      });
      this.workers.push(worker);

      // log worker resource usage
      /*setInterval(async () => {
              const usage = await worker.getResourceUsage();
              console.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
          }, 120000);*/
    }
  }
  getMediasoupWorker() {
    const worker = this.workers[this.nextMediasoupWorkerIdx];

    if (++this.nextMediasoupWorkerIdx === this.workers.length) {
      this.nextMediasoupWorkerIdx = 0;
    }

    return worker;
  }

  async setupRoom(roomName: string) {
    try {

      let worker = await this.getMediasoupWorker();
      const room = this.rooms.addRoom(roomName, worker, this.io);
      return room
    } catch (error) {
      console.log(error)
    }

  }

  async createWebRtcTransport(roomName ? : string): Promise<TransportResponse> {
    const router = this.rooms.getRoomRouter(roomName);

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
    const router = this.rooms.getRoomRouter(roomName);
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

  sendResponse(room: string = "_default_room", message: MessageResponse) {
    // this.io.emit(room,  message);
    this.io.in(room).emit("message", message);

  }
  errorResponse(room: string = "_default_room", message: MessageError) {
    this.io.emit(room, message);
  }

  callBack(message: MessageResponse, ack: Function) {
    ack(message);
  }

  async onGetCurrentProducers(event: MessageObject, callback: Function) {
    try {
      const roomName = this.getSocketRoomName();

      const remoteVideoIds = this.rooms.getRoomProducerRemoteIds(roomName, event.clientId, "video")
      const remoteAudioIds =  this.rooms.getRoomProducerRemoteIds(roomName, event.clientId, "audio")
      const res: MessageResponse = {
        type: MessageResponsesTypes.CurrentProducers,
        data: { remoteVideoIds: remoteVideoIds, remoteAudioIds: remoteAudioIds }
      }
      console.log(res);
      this.callBack(res, callback);

    } catch (error) {
        console.log(error)
        const errorMsg: MessageError = {
          errorMsg: error.message, 
          error: true
        }
        this.errorResponse("error", errorMsg)
      
    }
  }
  async onGetRouterRtpCapabilities(event: MessageObject, callback: Function) {
    try {

      const router = this.rooms.getRoomRouter("_default_room");
      if (router) {
        const res: MessageResponse = {
          "type": MessageResponsesTypes.RouterCap, 
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
        console.log(error)
        const errorMsg: MessageError = {
          errorMsg: error.message, 
          error: true
        }
        this.errorResponse("error", errorMsg)
          
    }

  }
  async onPrepareRoom(event: MessageObject, callback: Function) {
    try {
      // this.rooms.addRoom(event.roomName);
      this.setupRoom(event.roomName);
      this.setSocketRoomName(event.roomName);
      const msg: MessageResponse = {
        type: MessageResponsesTypes.RoomCreated,
        data: {
          roomName: event.roomName
        }
      }
      // this.io.emit("message", msg);
      this.io.join(event.roomName);
      this.callBack(msg, callback);

    } catch (error) {
      console.log(error);
      const msg: MessageResponse = {
        type: MessageResponsesTypes.RoomCreated,
        data: {
          roomName: event.roomName
        }
      }
      // this.io.emit("message", msg);
      this.io.join(event.roomName);
      this.callBack(msg, callback);
    }

  }

  async onCreateProducerTransport(event: MessageObject, callback: Function) {
    try {
      console.log("oncreateProducerTransport")
      const roomName = this.getSocketRoomName();
      const {
        transport,
        params
      } = await this.createWebRtcTransport(roomName);
      const id =this.getSocketId();
      transport.observer.on('close', () => {
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
      this.rooms.addRoomProducerTransport(roomName, id, transport)
      console.log(this.rooms.getRoomProducerTransport(roomName, id))
      const res: MessageResponse = {
        "type": MessageResponsesTypes.PubTransportCreated, 
        data: params 
      }
      this.callBack(res, callback);
    } catch (error) {
      console.log(error)
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
      console.log(roomName, id)
      const {
        transport,
        params
      } = await this.createWebRtcTransport(roomName)
      console.log(params)
      transport.observer.on('close', () => {
        const id = this.getSocketId();
        this.rooms.removeRoomConsumerTransport(roomName, id);
        this.rooms.removeRoomConsumerTransport(roomName, id);
      })
      this.rooms.addRoomConsumerTransport(roomName,id, transport);
      const res: MessageResponse = {
        "type": MessageResponsesTypes.SubTransportCreated,
        data: params, 
      }
      console.log(res);
      this.callBack(res, callback);
    } catch(error) {
      console.log(error)
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
        "type": MessageResponsesTypes.PubConnected, 
      }
      this.callBack(res, callback);
  } catch(error) {
      console.log(error)
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
        "type": MessageResponsesTypes.SubConnected, 
      }
      this.callBack(res, callback);
    } catch(error) {
      console.log(error)
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
        type: MessageResponsesTypes.Published, 
        data: {

          id: producer.id,
          socketId: id,
          producerId: producer.id,
          kind: producer.kind
        }
      }
      this.callBack(res, callback);
      // inform clients about new producer
      if (roomName) {
        // broadcast to room
        this.io.broadcast.to(roomName).emit('message', res);
      } else {
        // emit new producer 
        this.io.emit('message', res);
      }

    } catch(error) {
      console.log(error)
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
          "type": MessageResponsesTypes.PubClosed, 
          data: { localId: id, remoteId: remoteId, kind: kind },
        }
        this.callBack(res, callback);
      })
      this.rooms.addRoomConsumer(roomName, id, remoteId, consumer, kind);
      const response: ConsumerTransportResponse = {
          consumer: consumer,
          params: params,
      }
      const res: MessageResponse = {
        "type": MessageResponsesTypes.Subscribed,
        data: response,
      }
      this.callBack(res, callback);

  } catch(error) {
      console.log(error)
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
        "type": MessageResponsesTypes.Resumed, 
      }
      this.callBack(res, callback);

    } catch(error) {
      console.log(error)
      const errorMsg: MessageError = {
        errorMsg: error.message, 
        error: true
      }
      this.errorResponse("error", errorMsg)
    }
  }

}

export default { Media, Room, Rooms, MessageNames};