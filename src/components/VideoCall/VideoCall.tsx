import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  SkipForward,
  Loader2,
  AlertCircle,
} from "lucide-react";

const socket = io("https://new-node-gzvq.onrender.com");

export function VideoCall() {
  const [waiting, setWaiting] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [error, setError] = useState("");

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const pendingSignals = useRef<any[]>([]);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        if (myVideo.current) myVideo.current.srcObject = stream;

        socket.emit("join-room");
      } catch {
        setError("Camera or Mic permission denied");
      }
    };

    initMedia();

    socket.on("match-found", ({ roomID, initiator }) => {
      setWaiting(false);
      if (streamRef.current) {
        createPeer(initiator, roomID, streamRef.current);
      }
    });

    socket.on("signal", (signal) => {
      if (peerRef.current) {
        peerRef.current.signal(signal);
      } else {
        pendingSignals.current.push(signal);
      }
    });

    return () => {
      socket.off("match-found");
      socket.off("signal");
      peerRef.current?.destroy();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const createPeer = (
    initiator: boolean,
    roomID: string,
    stream: MediaStream
  ) => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      },
    });

    peer.on("signal", (data) => {
      socket.emit("signal", { roomID, signal: data });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", console.error);

    // 🔥 Apply queued signals
    pendingSignals.current.forEach((s) => peer.signal(s));
    pendingSignals.current = [];

    peerRef.current = peer;
  };

  const handleSkip = () => {
    setWaiting(true);
    peerRef.current?.destroy();
    peerRef.current = null;
    if (userVideo.current) userVideo.current.srcObject = null;
    socket.emit("join-room");
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !cameraOn;
      setCameraOn(!cameraOn);
    }
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-black">
        <AlertCircle className="text-red-500 mr-2" /> {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="p-4 text-center font-bold bg-black">
        Omegle Clone
      </div>

      <div className="flex-1 flex gap-4 p-4">
        <div className="flex-1 bg-black rounded">
          {waiting ? (
            <Loader2 className="animate-spin m-auto mt-20" />
          ) : (
            <video ref={userVideo} autoPlay playsInline className="w-full h-full object-cover" />
          )}
        </div>

        <div className="w-1/3 bg-gray-800 rounded">
          <video
            ref={myVideo}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
        </div>
      </div>

      <div className="h-20 flex justify-center items-center gap-4 bg-black">
        <button onClick={toggleMic}>{micOn ? <Mic /> : <MicOff />}</button>
        <button onClick={toggleCamera}>{cameraOn ? <Video /> : <VideoOff />}</button>
        <button onClick={handleSkip}><SkipForward /></button>
      </div>
    </div>
  );
}
