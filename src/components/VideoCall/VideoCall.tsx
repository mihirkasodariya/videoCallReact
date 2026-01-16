import  { useEffect, useRef, useState } from "react";
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

// 🔥 Socket URL
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

  // 🔥 IMPORTANT: signal queue
  const pendingSignals = useRef<any[]>([]);

  // =========================
  // INIT CAMERA + SOCKET
  // =========================
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }

        socket.emit("join-room");
      } catch (err) {
        console.error(err);
        setError("Camera/Mic access denied");
      }
    };

    initMedia();

    socket.on("match-found", ({ roomID, initiator }) => {
      console.log("✅ Match found", roomID, initiator);
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
      streamRef.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.destroy();
    };
  }, []);

  // =========================
  // CREATE PEER
  // =========================
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
      console.log("🎥 Stranger video received");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", console.error);

    // 🔥 Apply queued signals
    pendingSignals.current.forEach((sig) => peer.signal(sig));
    pendingSignals.current = [];

    peerRef.current = peer;
  };

  // =========================
  // CONTROLS
  // =========================
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

  const handleSkip = () => {
    setWaiting(true);

    peerRef.current?.destroy();
    peerRef.current = null;

    if (userVideo.current) userVideo.current.srcObject = null;

    socket.emit("join-room");
  };

  // =========================
  // UI
  // =========================
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="p-6 border border-red-500 rounded">
          <AlertCircle className="mx-auto mb-2 text-red-500" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="p-4 text-center font-bold text-xl bg-black">
        Omegle Clone
      </div>

      <div className="flex-1 flex gap-4 p-4">
        <div className="flex-1 bg-black flex items-center justify-center rounded">
          {waiting ? (
            <Loader2 className="animate-spin w-12 h-12" />
          ) : (
            <video
              ref={userVideo}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
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

      <div className="h-20 flex justify-center gap-4 items-center bg-black">
        <button onClick={toggleMic}>
          {micOn ? <Mic /> : <MicOff />}
        </button>
        <button onClick={toggleCamera}>
          {cameraOn ? <Video /> : <VideoOff />}
        </button>
        <button onClick={handleSkip}>
          <SkipForward />
        </button>
      </div>
    </div>
  );
}
