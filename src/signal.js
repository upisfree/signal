import {
  AmbientLight,
  DirectionalLight,
  Color,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  AudioLoader,
  AudioListener,
  Audio
} from '../lib/three.module.js';
import { Krono } from '../lib/krono.esm.js';
import Analyser from './analyser.js';

class Signal {
  krono = null;
  analyser = null;
  listener = null;
  canvasContainer = null;

  ctx = new AudioContext();

  essentiaExtractor;
  audioURL = 'assets/audio/flip.wav';

  audioData;
  plotSpectrogram;
  plotContainerId = 'plot-container';

  isComputed = false;
  // settings for feature extractor
  frameSize = 1024;
  hopSize = 512;
  numBands = 96;

  // tmp
  box = null;
  audioLoader = null;

  constructor(canvasContainer) {
    this.krono = new Krono({
      canvasContainer: canvasContainer,
      scrollContainer: window,
      debug: true,
      editor: true,
      // keyframes: [[]], // insert keyframes here
      onLoad: this.onLoad.bind(this),
      onAfterTick: this.update.bind(this)
    });

    this.canvasContainer = canvasContainer;

    this.krono.load();
  }

  update() {
    if (this.box) {
      this.box.rotation.x += -0.01;
      this.box.rotation.y += -0.005;
    }
  }

  onLoad() {
    const { camera, scene } = this.krono;

    camera.position.z = 4;

    scene.background = new Color(0x000000);

    scene.add(new AmbientLight());
    scene.add(new DirectionalLight());

    this.box = new Mesh(
      new BoxGeometry(),
      new MeshBasicMaterial({
        wireframe: true
      })
    );

    scene.add(this.box);

    this.listener = new AudioListener();
    camera.add(this.listener);

    console.log(scene);


    // оно корректно обрабатываем микрфон?
    // лучше тогда микрофон просто получать через веб апи, а не триху
    window.addEventListener('click', () => {
      this.audioLoader = new AudioLoader();
      this.audioLoader.load(this.audioURL, (buffer) => {
        const sound = new Audio(this.listener);
        sound.autoplay = true;
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();

        this.analyser = new Analyser(this, sound);
      });
    });
  }

  // https://glitch.com/edit/#!/essentiajs-melspectrogram?path=script.js%3A17%3A0
  // https://essentiajs-melspectrogram.netlify.app/



  // async onClick() {
  //   // load audio file from an url
  //   this.ctx.resume();
  //   this.audioData = await essentiaExtractor.getAudioChannelDataFromURL(audioURL, audioCtx);
  //
  //   // if already computed, destroy plot traces
  //   if (isComputed) { plotSpectrogram.destroy(); };
  //
  //   // modifying default extractor settings
  //   essentiaExtractor.frameSize = frameSize;
  //   essentiaExtractor.hopSize = hopSize;
  //   // settings specific to an algorithm
  //   essentiaExtractor.profile.MelBands.numberBands = numBands;
  //
  //   // Now generate overlapping frames with given frameSize and hopSize
  //   // You could also do it using pure JS to avoid arrayToVector and vectorToArray conversion
  //   let audioFrames = essentiaExtractor.FrameGenerator(audioData, frameSize, hopSize);
  //   let logMelSpectrogram = [];
  //   for (var i=0; i<audioFrames.size(); i++) {
  //     logMelSpectrogram.push(essentiaExtractor.melSpectrumExtractor(essentiaExtractor.vectorToArray(audioFrames.get(i))));
  //   }
  //
  //   // plot the feature
  //   plotSpectrogram.create(
  //     logMelSpectrogram, // input feature array
  //     "LogMelSpectrogram", // plot title
  //     audioData.length, // length of audio in samples
  //     audioCtx.sampleRate, // audio sample rate,
  //     hopSize // hopSize
  //   );
  //   // essentiaExtractor.algorithms.delete();
  //   isComputed = true;
  // }
}

export default Signal;
