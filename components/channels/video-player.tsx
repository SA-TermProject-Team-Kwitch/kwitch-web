"use client";

import React, { useEffect, useRef } from "react";
import { useSocket } from "@/lib/socket";

export default function VideoPlayer({ roomid: roomName }: { roomid: string }) {
  const socket = useSocket();

  const peerConnectionRef = useRef<RTCPeerConnection>(
    new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const peerConnection = peerConnectionRef.current;

    socket.on("offer", async (_: string, offer: RTCSessionDescription) => {
      peerConnection
        .setRemoteDescription(offer)
        .then(() => peerConnection.createAnswer())
        .then((sdp) => peerConnection.setLocalDescription(sdp))
        .then(() => {
          socket.emit("answer", peerConnection.localDescription, roomName);
        });

      peerConnection.ontrack = (event) => {
        videoRef.current!.srcObject = event.streams[0];
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice", event.candidate, roomName);
        }
      };
    });

    socket.on("ice", async (_: string, candidate: RTCIceCandidate) => {
      await peerConnection.addIceCandidate(candidate);
    });

    return () => {
      // TODO: leave room
      peerConnection.close();
      socket.off("offer");
      socket.off("ice");
    };
  }, []);

  // TODO: video overflow
  return <video className="h-full bg-black" ref={videoRef} autoPlay />;
}
