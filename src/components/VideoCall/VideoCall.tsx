import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer"; // Ensure: npm install simple-peer
import { Mic, MicOff, Video, VideoOff, SkipForward, Loader2, AlertCircle } from "lucide-react";

// NOTE: Mobile testing ke liye apni Local IP use karein (e.g., http://192.168.1.5:5000)
const socket = io("https://new-node-gzvq.onrender.com"); 

export function VideoCall() {
  const [waiting, setWaiting] = useState<boolean>(true);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Refs for HTML Elements
  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);

  // Refs for Logic (State ki jagah Ref use karein taaki stale data na ho)
  const connectionRef = useRef<Peer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // ✅ Stream yahan store karenge
  
  useEffect(() => {
    // 1. Camera Access Function
    const getMedia = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        // Stream ko Ref aur Video element me set karein
        streamRef.current = currentStream;
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        // Camera milne ke baad hi room join karein
        socket.emit("join-room");
      } catch (err) {
        console.error("Camera Error:", err);
        setError("Camera/Mic access denied or unavailable.");
      }
    };

    getMedia();

    // 2. Socket Listeners
    socket.on("match-found", ({ roomID, initiator }) => {
      console.log("🚀 Match Found! ID:", roomID, "Am I initiator?", initiator);
      setWaiting(false);
      
      // ✅ Yahan hum Ref se stream le rahe hain jo kabhi null nahi hoga (agar camera on hai)
      if (streamRef.current) {
        initiatePeer(initiator, roomID, streamRef.current);
      } else {
        console.error("Stream not ready yet!");
      }
    });

    socket.on("signal", (data) => {
      // Jab signal aaye to peer me daalo
      if (connectionRef.current && !connectionRef.current.destroyed) {
        connectionRef.current.signal(data);
      }
    });

    // Cleanup on Unmount
    return () => {
      socket.off("match-found");
      socket.off("signal");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // WebRTC Logic
  const initiatePeer = (initiator: boolean, roomID: string, localStream: MediaStream) => {
    // ✅ IMP: STUN Servers add karna zaroori hai
    const peer = new Peer({
      initiator: initiator,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" }
        ]
      }
    });

    peer.on("signal", (data) => {
      socket.emit("signal", { signal: data, roomID });
    });

    peer.on("stream", (remoteStream) => {
      console.log("🎥 Remote Video Aaya!");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer Error:", err);
    });

    peer.on("close", () => {
        console.log("Peer connection closed");
    });

    connectionRef.current = peer;
  };

  const handleSkip = () => {
    setWaiting(true);
    
    // Purana connection destroy karein
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
    
    // Remote video clear karein
    if (userVideo.current) userVideo.current.srcObject = null;
    
    // Server ko bole naya dhoondo
    socket.emit("join-room");
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const track = streamRef.current.getAudioTracks()[0];
      if(track) {
          track.enabled = !micOn;
          setMicOn(!micOn);
      }
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if(track) {
        track.enabled = !cameraOn;
        setCameraOn(!cameraOn);
      }
    }
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
         <div className="text-center p-6 bg-red-900/20 border border-red-500 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h2 className="text-xl font-bold">{error}</h2>
            <p className="mt-2 text-sm text-gray-400">Please allow camera permissions and reload.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 bg-black border-b border-gray-800 text-center font-bold text-xl text-blue-500">
        Omegle Clone
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4">
        {/* Remote Video (Stranger) */}
        <div className="flex-1 bg-black rounded-xl overflow-hidden relative flex items-center justify-center border border-gray-700">
          {waiting ? (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-semibold">Searching for a partner...</h2>
            </div>
          ) : (
            // ✅ PlaysInline zaruri hai mobile browsers ke liye
            <video playsInline autoPlay ref={userVideo} className="w-full h-full object-cover" />
          )}
          <span className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-sm font-semibold">
            Stranger
          </span>
        </div>

        {/* My Video */}
        <div className="h-48 md:h-auto md:w-1/3 bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700">
           <video playsInline muted autoPlay ref={myVideo} className="w-full h-full object-cover transform scale-x-[-1]" />
           <span className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-sm font-semibold">
             You
           </span>
        </div>
      </div>

      {/* Controls */}
      <div className="h-20 bg-gray-950 flex items-center justify-center gap-6 border-t border-gray-800">
        <button onClick={toggleMic} className={`p-4 rounded-full ${micOn ? 'bg-gray-800' : 'bg-red-600'}`}>
          {micOn ? <Mic /> : <MicOff />}
        </button>
        
        <button onClick={toggleCamera} className={`p-4 rounded-full ${cameraOn ? 'bg-gray-800' : 'bg-red-600'}`}>
          {cameraOn ? <Video /> : <VideoOff />}
        </button>

        <button 
          onClick={handleSkip}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full flex items-center gap-2 transition"
        >
          Skip <SkipForward />
        </button>
      </div>
    </div>
  );
};