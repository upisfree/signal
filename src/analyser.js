class Analyser {
  constructor(signal, audio) {
    this.signal = signal;

    // сейчас это просто файл, потом поток из микрофона
    this.audio = audio;
    this.analyser = audio.context.createAnalyser();

    console.log(this);
  }
}

export default Analyser;
