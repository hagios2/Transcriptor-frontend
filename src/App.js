import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import axios from "axios";
import Navbar from "./components/Navbar";
const AudioRecorder = () => {
  const [waveSurfer, setWaveSurfer] = useState(null);
  const [recordPlugin, setRecordPlugin] = useState(null);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [continuousWaveform] = useState(true);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [screen, setScreen] = useState(1);
  const userId = useRef(1); //this could be the logged in users id

  const micRef = useRef(null);
  const recordingsRef = useRef();

  useEffect(() => {
    console.log(process.env.REACT_APP_API_URL);
    createWaveSurfer();

    return () => {
      if (waveSurfer) waveSurfer.destroy();
    };
  }, []);

  const createWaveSurfer = () => {
    if (waveSurfer) waveSurfer.destroy();

    const ws = WaveSurfer.create({
      container: micRef.current,
      waveColor: "rgb(200, 0, 200)",
      progressColor: "rgb(100, 0, 100)",
      width: 728,
      fillParent: true,
      // container: 'body',
    });

    const record = RecordPlugin.create({
      renderRecordedAudio: false,
      continuousWaveform,
      continuousWaveformDuration: 30,
      mimeType: "video/mp4",
    });

    ws.registerPlugin(record);

    record.on("record-end", async (blob) => {
      const recordedUrl = URL.createObjectURL(blob);
      setAudioBlob(blob);

      const playbackWaveSurfer = WaveSurfer.create({
        container: recordingsRef.current,
        waveColor: "rgb(200, 100, 0)",
        progressColor: "rgb(100, 50, 0)",
        url: recordedUrl,
      });

      recordingsRef.current.innerHTML = "";

      const playButton = document.createElement("button");
      playButton.textContent = "Play";
      playButton.onclick = () => playbackWaveSurfer.playPause();
      playbackWaveSurfer.on("pause", () => (playButton.textContent = "Play"));
      playbackWaveSurfer.on("play", () => (playButton.textContent = "Pause"));

      // recordingsRef.current.appendChild(playButton);

      await submitAudio(blob);
    });

    setWaveSurfer(ws);
    setRecordPlugin(record);
  };

  const startRecording = async () => {
    setScreen(2);
    recordPlugin.startRecording();
    setRecording(true);
    setPaused(false);
  };

  const stopRecording = async () => {
    await recordPlugin.stopRecording();
    setRecording(false);
    setPaused(false);
  };

  const submitAudio = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "recording.mp4");
    formData.append("user_id", userId.current);

    const headers = {
      "Content-Type": "multipart/form-data",
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/transcribe/audio`,
        formData,
        headers
      );
      console.log("resp", response.data);
      setTranscripts((prevTranscripts) => [response.data, ...prevTranscripts]);
      console.log(transcripts);
    } catch (error) {
      console.error("Error submitting audio:", error);
    }
  };

  const fetchAudioDevices = async () => {
    const devices = await RecordPlugin.getAvailableAudioDevices();
    setAvailableDevices(devices);
  };

  // eslint-disable-next-line no-script-url
  const href = 'javascript:void(0);'

  useEffect(() => {
    fetchAudioDevices();
  }, []);

  return (
    <div>
      <div className="body">
        <Navbar />
        {screen === 1 ? (
          <div className="container">
            <div id="mic" ref={micRef}></div>
            <div className="header">
              <div className="header_text_container">
                <h1 className="header_text">Welcome to Darli</h1>
              </div>
              <button className="button" onClick={startRecording}>
                {"Start Recording"}
              </button>
            </div>
          </div>
        ) : (
          <div className="main_trans">
            <div className="recorder">
              <div className="mic">
                <div id="mic" ref={micRef}></div>
              </div>

              {recording ? (
                <div className="">
                  <a className="" href={href} onClick={stopRecording}>
                    <span className="end_button">x</span>
                    <span className="end_button_text">Click to end </span>
                  </a>
                </div>
              ) : (
                <div className="btn">
                  <button
                    className="button"
                    onClick={recording ? stopRecording : startRecording}
                  >
                    {recording ? "Stop Recording" : "Start Recording"}
                  </button>
                </div>
              )}
              <div id="recordings" ref={recordingsRef}></div>
            </div>
            <div className="trans_parent">
              <div className="transcripts">
                <h3>Transcript</h3>
                <div className="trans_content">
                  {transcripts.map((transcript, index) => (
                    <div className="transcriptItem" key={index}>
                      <div className="transcriptInner">
                        <span className="timestamp">
                          {transcript.timestamp}
                        </span>
                        <p>{transcript.transcription}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
