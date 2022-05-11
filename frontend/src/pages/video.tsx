import React, {useState, useContext, useCallback, useEffect, createRef, useRef} from 'react';
import { Box, Grid, Typography, Stack, useTheme, Button, Input, Checkbox, breadcrumbsClasses, Select, MenuItem } from '@mui/material';

import { Device } from 'mediasoup-client';

import { Transport, DtlsParameters, RtpCodecParameters, Producer, RtpCapabilities } from 'mediasoup-client/lib/types';
import { useHistory } from 'react-router-dom';
import { elementTypeAcceptingRef } from '@mui/utils';
import { v4 as uuidv4 } from 'uuid';



const VideoComponent = (props = {stream: null}) => {
  const video = useRef<HTMLVideoElement>();
  console.log(props.stream)
  useEffect(() => {

    console.log(props.stream)
    video.current.srcObject = props.stream;
    video.current.volume = 0;
    playVideo();
  }, [props.stream, video])
  const playVideo = () => {
    if (video.current.srcObject) {
      // already playing
    }
    video.current.play()
  }
  const pauseVideo = () => {
    video.current.pause();
    video.current.srcObject = null;
  }
  const stopVideo = () => {
    props.stream.getTracks().forEach(track => track.stop());

  }
  return (
    <div>
      <video autoPlay controls  id="video" ref={video}/>
    </div>
  );
}
// const RemoteVideoComponent = (props = {transport, videoId, audioId}) => {
//   return (<div></div>)
// }
const AudioComponent = (props = {}) => {
  const audio = useRef<HTMLAudioElement>();
  return (
    <div>
      <audio autoPlay controls ref={audio}></audio>
    </div>
  )
}


const RoomComponent = (props = {}) => {
  const [name, setName] = useState('Donalod Trump');
  const [room, setRoom] = useState('White House');
  const history = useHistory();

  const handleSubmit = (e) => {
    // setName();
    history.push(`/room/${room}/user/${name}`);
  };
  return (
    <form onSubmit={handleSubmit}>
      <label>Name your broadcast:</label>{' '}
      <input
        id='roomidInput'
        placeholder={room}
        onChange={(e) => setRoom(e.target.value)}
        type='text'
      />
      <label>Broadcast yourself:</label>{' '}
      <input
        id='nameInput'
        placeholder={name}
        onChange={(e) => setName(e.target.value)}
        type='text'
      />
      <button id='joinButton' type='submit'>
        Go live!
      </button>
    </form>
  );
}
class Message {
  constructor() {}
}
/**
* home page
*
* @param props
*/
const VideoPage = (props = {}) => {
  console.log("uwu")

  const theme = useTheme();
  // const videoProducer = useRef();
  // const audioProducer = useRef();
  // let localMediaStream = null;
  // const [localMediaStream, setLocalMediaStream] = useState(null);
  const localMediaStream = useRef(null);
  let producers = new Map();
  let consumers = new Map();
  let producerLabel = new Map();
  const videos =  useRef<HTMLElement>(null);
  const localMediaEl =  useRef<HTMLElement>(null);
  const remoteVideoEl =  useRef<HTMLElement>(null);
  const remoteAudioEl =  useRef<HTMLElement>(null);
  const producerTransport = useRef(null);
  const consumerTransport = useRef(null);
  // let producerTransport = null;
  // let consumerTransport = null;
  // const [producerTransport, setProducerTransport] = useState(null);
  // const [consumerTransport, setConsumerTransport] = useState(null);

  const [roomName, setRoomName] = useState(uuidv4());
  const [clientId, setclientId] = useState(window.NFTSocket.socket.id);
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]); 
  const [audioDeviceId, setAudioDeviceId] = useState("");
  const [videoDeviceId, setVideoDeviceId] = useState("");

  // const producerTransport = useRef();
  // const id = useRef();
  // useEffect(() => {

  // }, [videoRemoteIds, audioRemoteIDs, consumerTransport])
  // const device = useRef(new Device());
  // const [device, setDevice] = useState(null);
  const device = useRef(new Device())
  // let device = null
  const socket = useRef(window.NFTSocket.socket); 
  const sendEmit = (data) => {
    return new Promise((resolve, reject) => {
      socket.current.emit("message", data, (response) => {
        if (response.error === undefined) {
          console.log(response);
          resolve(response);
        } else {
          reject(response);
        }
      })
    })
  }
  const getCurrentProducers = async () => {
      const msg = {
      "type": "getCurrentProducers",
      "clientId": clientId, 
    }
    const resp = await sendEmit(msg);
    setVideoRemoteIds(resp.data.remoteVideoIds);
    setAudioRemoteIds(resp.data.remoteAudioIds);
  }
  const initProducerTransport = async (device) => {
    const msg = {
      type: "createProducerTransport"
    };
    const producerData = await sendEmit(msg);
    producerTransport.current = device.createSendTransport(producerData.data)
    producerTransport.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
      const msg = {
        type: "connectProducerTransport",
        forceTcp: false,
        dtlsParameters: dtlsParameters,
      };
      sendEmit(msg).then(callback).catch(errback);

    })
    producerTransport.current.observer.on('newproducer', (data) => {
      console.log("uwu new producer uwu")
      console.log(data);
    })
    producerTransport.current.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
      try {
        console.log("uwuw producing uwuw")
        const msg = {
          type: "produce",
          kind: kind,
          rtpParameters: rtpParameters
        };
        const produce = await sendEmit(msg);
        console.log("produce", produce);
        callback(produce.data.id);

      } catch (error) {
        errback(error)
      }
    })
    producerTransport.current.on('connectionstatechange', (state) => {
      switch (state) {
        case 'connecting':
          console.log('connecting')
          break;
        case 'connected':
          console.log('connected')
          break;
        case 'failed':
          console.log('producer failed');
          producerTransport.current.close();
          break;
        default:
          break;
      }
    })



  }
  const initConsumerTransport = async (device) => {
    // init consumer transport
    const msg = {
      type: "createConsumerTransport",
    };
    const consumerData = await sendEmit(msg);
    consumerTransport.current = device.createRecvTransport(consumerData.data)
    consumerTransport.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
      const msg = {
        type: "connectConsumerTransport",
        transportId: consumerTransport.current.id,
        dtlsParameters: dtlsParameters
      }
      sendEmit(msg).then(callback).catch(errback)
    })
    consumerTransport.current.on('connectionstatechange', async (state) => {
      switch (state) {
        case 'connecting':
          console.log("connecting")
          break;
        case 'connected':
          console.log('connected')
          break;
        case 'failed':
          consumerTransport.current.close()
          break;
      }
    })
  } 
  const initTransports = async (device) => {
    await initProducerTransport(device);
    await initConsumerTransport(device);
  }

  const messageHandler = async (event) => {
    const onPublished = (data) => {
      console.log(data)
      consume(data)
    }
    switch (event.type) {
      case "published":
        onPublished(event.data)
        break;
      default:
        break;
    }
  }


  const mediaDevices = async () => {
    console.log("media devices");
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInput = devices.filter(
      (device) => device.kind === "videoinput"
    );
    setVideoDevices(videoInput)

    const audioInput = devices.filter(
      (device) => device.kind === "audioinput"
    );
    setAudioDevices(audioInput);
  }

  useEffect(async () => {
    // subscribe to socket events

    // socket.current.on("message", messageHandler);
   const roomMsg = {
      type: "prepareRoom",
      roomName: roomName,
    }
    await sendEmit(roomMsg).then(async (e) => {
      console.log();
      const msg = {
          "type": "getRouterRtpCapabilities"
      }
      const routerRtpCapabilities = await sendEmit(msg);
      console.log(routerRtpCapabilities);

    await device.current.load({
      routerRtpCapabilities: routerRtpCapabilities.data
    });
      await initTransports(device.current);
      await mediaDevices();

      socket.current.on('message', messageHandler);
    })



  }, [socket]);
  const exit = () => {

      const {audioArr, videoArr} =  mediaDevices();
    console.log(audioArr, videoArr);

    //   setAudioDevices([...audioArr]);
    //   setVideoDevices([...videoArr]);
    // console.log(audioDevices);
    // console.log(videoDevices);
  }
  const getConsumeStream = async (producerId)  =>{
    const { rtpCapabilities } = device.current;
    console.log('rtpcaps ', rtpCapabilities);
    const msg = {
      type: "consume",
      rtpCapabilities,
      consumerTransportId: consumerTransport.current.id, // might be
      producerId,
    }
    const data = await sendEmit(msg)
    const { id, kind, rtpParameters } = data;

    console.log('data === ', data);

    let codecOptions = {};
    const consumer = await consumerTransport.current
      .consume({
        id,
        producerId,
        kind,
        rtpParameters,
        codecOptions,
      })
      .then((result) => {
        console.log('bbbbbbb', result);
        return result;
      });
    console.log('consumer === ', consumer);

    const stream = new MediaStream();
    console.log('stream === ', stream);
    stream.addTrack(consumer.track);
    console.log('kind ', kind);
    return {
      consumer,
      stream,
      kind,
    };
  }

  const removeConsumer = (consumer_id) => {
    let elem = document.getElementById(consumer_id);
    elem.srcObject.getTracks().forEach(function (track) {
      track.stop();
    });
    elem.parentNode.removeChild(elem);

    consumers.delete(consumer_id);
  }
  const consume = async (data) => {
    const { producerId } = data;
    getConsumeStream(producerId).then(
      ({ consumer, stream, kind }) => {
        consumers.set(consumer.id, consumer);

        let elem;
        console.log('clg kind === ', kind);
        if (kind === 'video') {
          console.log('cons vid');
          elem = document.createElement('video');
          elem.srcObject = stream;
          elem.id = consumer.id;
          elem.playsinline = false;
          elem.autoplay = true;
          elem.className = 'vid';
          remoteVideoEl.current.appendChild(elem);
        } else {
          elem = document.createElement('audio');
          elem.srcObject = stream;
          elem.id = consumer.id;
          elem.playsinline = false;
          elem.autoplay = true;
          remoteAudioEl.current.appendChild(elem);
        }

        consumer.on(
          'trackended',
          function () {
            removeConsumer(consumer.id);
          }
        );
        consumer.on(
          'transportclose',
          function () {
            removeConsumer(consumer.id);
          }
        );
      })
  }
  const produce = async (type) => {
    let mediaConstraints = {};
    let audio = false;
    let screen = false;

    switch (type) {
      case 'audio':
        mediaConstraints = {
          audio: {
            deviceId: audioDeviceId,
          },
          video: false,
        };
        audio = true;
        break;
      case 'video':
        mediaConstraints = {
          audio: false,
          video: {
            width: {
              min: 640,
              ideal: 1920,
            },
            height: {
              min: 400,
              ideal: 1080,
            },
            deviceId: videoDeviceId,
            /*aspectRatio: {
                          ideal: 1.7777777778
                      }*/
          },
        };
        break;
      case 'screen':
        mediaConstraints = false;
        screen = true;
        break;
      default:
        return;
    }
    if (device.current && !device.current.canProduce('video') && !audio) {
      console.error('cannot produce video');
      return;
    }
    if (producerLabel.has(type)) {
      console.log('producer already exists for this type ' + type);
      return;
    }
    console.log('mediacontraints:', mediaConstraints);
    let stream;
    try {
      stream = screen
        ? await navigator.mediaDevices.getDisplayMedia()
        : await navigator.mediaDevices.getUserMedia(mediaConstraints);
      console.log(navigator.mediaDevices.getSupportedConstraints());

      const track = audio
        ? stream.getAudioTracks()[0]
        : stream.getVideoTracks()[0];
      const params = {
        track,
      };
      if (!audio && !screen) {
        params.encodings = [
          {
            rid: 'r0',
            maxBitrate: 100000,
            //scaleResolutionDownBy: 10.0,
            scalabilityMode: 'S1T3',
          },
          {
            rid: 'r1',
            maxBitrate: 300000,
            scalabilityMode: 'S1T3',
          },
          {
            rid: 'r2',
            maxBitrate: 900000,
            scalabilityMode: 'S1T3',
          },
        ];
        params.codecOptions = {
          videoGoogleStartBitrate: 1000,
        };
      }
      console.log('audio', audio);
      console.log(producerTransport.current);

    //   await initProducerTransport(device.current);
      const producer = await producerTransport.current.produce(params);
      console.log(kek);

      producers.set(producer.id, producer);
      console.log('producer', producer);


      let elem;
      console.log("uwu elems")
      if (!audio) {
        elem = document.createElement('video');
        console.log(elem)
        elem.srcObject = stream;
        elem.id = producer.id;
        elem.playsinline = false;
        elem.autoplay = true;
        elem.className = 'vid';
        localMediaEl.current.appendChild(elem);
      }

      producer.on('trackended', () => {
        closeProducer(type);
      });

      producer.on('transportclose', () => {
        console.log('producer transport close');
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track) {
            track.stop();
          });
          elem.parentNode.removeChild(elem);
        }
        producers.delete(producer.id);
      });

      producer.on('close', () => {
        console.log('closing producer');
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track) {
            track.stop();
          });
          elem.parentNode.removeChild(elem);
        }
        producers.delete(producer.id);
      });

      producerLabel.set(type, producer.id);

      // switch (type) {
      //   case mediaType.audio:
      //     this.event(_EVENTS.startAudio);
      //     break;
      //   case mediaType.video:
      //     this.event(_EVENTS.startVideo);
      //     break;
      //   case mediaType.screen:
      //     this.event(_EVENTS.startScreen);
      //     break;
      //   default:
      //     return;
      // }
    } catch (err) {
      console.log(err);
    }
  }
  const closeProducer = async (type) => {
    if (!producerLabel.has(type)) {
      console.log('there is no producer for this type ' + type);
      return;
    }
    let producer_id = producerLabel.get(type);
    console.log(producer_id);
    const msg = {
      type: "producerClosed",
      producerId: producer_id

    }
    await sendEmit(msg);
    producers.get(producer_id).close();
    producers.delete(producer_id);
    producerLabel.delete(type);

    if (type !== 'audio') {
      let elem = document.getElementById(producer_id);
      elem.srcObject.getTracks().forEach(function (track) {
        track.stop();
      });
      elem.parentNode.removeChild(elem);
    }

    // switch (type) {
    //   case mediaType.audio:
    //     event(_EVENTS.stopAudio);
    //     break;
    //   case mediaType.video:
    //     this.event(_EVENTS.stopVideo);
    //     break;
    //   case mediaType.screen:
    //     this.event(_EVENTS.stopScreen);
    //     break;
    //   default:
    //     return;
    // }
  }
  const pauseProducer = (type) => {
    if (producerLabel.has(type)) {
      console.log('there is no producer for this type ' + type);
      return;
    }
    let producer_id = producerLabel.get(type);
    producers.get(producer_id).pause();
  } 
  const resumeProducer = (type) => {
        if (!producerLabel.has(type)) {
      console.log('there is no producer for this type ' + type);
      return;
    }
    let producer_id = producerLabel.get(type);
    producers.get(producer_id).resume();
  }


  // return jsx
  return (
    <div>
       <div>
        <button id='exitButton' onClick={exit}>
          Exit
        </button>
          <div>
          <span>audio:</span>
            <Select
              id='audioSelect'
              onChange={(event) => { setAudioDeviceId(event.target.value as string)}}
            >
                {audioDevices.map(data => (
                  <MenuItem key={data.deviceId} value={data.deviceId}>
                      {data.label}
                  </MenuItem>
                ))}
            </Select>
            <br />
          <span>video:</span>
            <Select
              id='videoSelect'
              onChange={(event) => { setVideoDeviceId(event.target.value as string)}}
            >
                {videoDevices.map(data => (
                  <MenuItem key={data.deviceId} value={data.deviceId}>
                      {data.label}
                  </MenuItem>
                ))}
            </Select>
            <br />
            <button
              id='startAudioButton'
              onClick={() =>
                produce("audio")
              }>
              audio
            </button>
            <button
              id='stopAudioButton'
              onClick={() => closeProducer("audio")}>
              close audio
            </button>
            <button
              id='startVideoButton'
              onClick={() =>
                produce("video")
              }>
              video
            </button>
            <button
              id='stopVideoButton'
              onClick={() => closeProducer("video")}>
              close video
            </button>
            <button
              id='startScreenButton'
              onClick={() => produce("screen")}>
              screen
            </button>
            <button
              id='stopScreenButton'
              onClick={() => closeProducer("screen")}>
              close screen
            </button>
          </div>
        </div>
      {/* <div>
        <VideoComponent stream={localMediaStream}></VideoComponent>

      </div> */}
      <div id='videoMedia' ref={videos}>
        <div id='localMedia' ref={localMediaEl}></div>

        <div id='remoteVideos' ref={remoteVideoEl}></div>

        <div id='remoteAudios' ref={remoteAudioEl}></div>
      </div>
    </div>
  );
};

// export default
export default VideoPage;

