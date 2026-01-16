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

const socket = io("https://new-node-gzvq.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
});

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

  // =======================
  // INIT CAMERA
  // =======================
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (myVideo.current) {
          myVideo.current.srcObject = stream;
          myVideo.current.muted = true;
          await myVideo.current.play();
        }

        socket.emit("join-room");
      } catch (err) {
        console.error(err);
        setError("Camera / Mic permission denied");
      }
    };

    init();

    socket.on("match-found", ({ roomID, initiator }) => {
      setWaiting(false);
      if (streamRef.current) {
        createPeer(initiator, roomID, streamRef.current);
      }
    });

    socket.on("signal", (signal) => {
      if (!signal) return;

      if (peerRef.current && !peerRef.current.destroyed) {
        try {
          peerRef.current.signal(signal);
        } catch (e) {
          console.warn("Signal ignored", e);
        }
      } else {
        pendingSignals.current.push(signal);
      }
    });

    return () => {
      socket.off("match-found");
      socket.off("signal");
      pendingSignals.current = [];
      peerRef.current?.destroy();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // =======================
  // CREATE PEER
  // =======================
  const createPeer = (
    initiator: boolean,
    roomID: string,
    stream: MediaStream
  ) => {
    peerRef.current?.destroy();

    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      },
    });

    peer.on("signal", (data) => {
      if (data) socket.emit("signal", { roomID, signal: data });
    });

    peer.on("stream", (remoteStream) => {
      if (!userVideo.current) return;

      userVideo.current.srcObject = remoteStream;
      userVideo.current.muted = false;

      userVideo.current.onloadedmetadata = () => {
        userVideo.current
          ?.play()
          .catch((e) => console.warn("Autoplay blocked:", e));
      };
    });

    peer.on("error", (err) => console.error("Peer error:", err));

    // Apply queued signals safely
    pendingSignals.current.forEach((s) => {
      try {
        peer.signal(s);
      } catch {}
    });
    pendingSignals.current = [];

    peerRef.current = peer;
  };

  // =======================
  // CONTROLS
  // =======================
  const handleSkip = () => {
    setWaiting(true);
    pendingSignals.current = [];
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
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <AlertCircle className="text-red-500 mr-2" /> {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="p-4 bg-black text-center font-bold">
        Random Video Call
      </div>

      <div className="flex-1 flex gap-4 p-4">
        <div className="flex-1 bg-black rounded overflow-hidden">
          {waiting ? (
            <Loader2 className="animate-spin m-auto mt-20" />
          ) : (
            <video
              ref={userVideo}
              playsInline
              autoPlay
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="w-1/3 bg-gray-800 rounded overflow-hidden">
          <video
            ref={myVideo}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        </div>
      </div>

      <div className="h-20 bg-black flex justify-center items-center gap-6">
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
