import SocketClient from "socket.io-client"
import { createContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import {v4 as UUIDv4 } from "uuid";
import { peerReducer } from "../Reducers/peerReducer";
import { addPeerAction } from "../Actions/peerAction";

const WS_Server = "https://video-chat-app-backend-zmxi.onrender.com";

export const SocketContext = createContext<any | null>(null); 

const socket = SocketClient(WS_Server,{
    withCredentials: false,
    transports: ["polling","websocket"]
});

interface Props {
    children: React.ReactNode
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<Peer>();
    const [stream, setStream] = useState<MediaStream>();
    const [peers, dispatch] = useReducer(peerReducer, {});

    const fetchParticipantList = ({roomId, participants}: {roomId: string, participants: string[]}) => {
        console.log("Fetched room participants");
        console.log(roomId, participants);
    }

    const fetchUserFeed = async() => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            console.log("✅ Got local stream:", stream.id);
            console.log("Stream tracks:", stream.getTracks().map(t => t.kind));
            setStream(stream);
        } catch (error) {
            console.error("❌ Error getting user media:", error);
        }
    }

    useEffect(() => {
        const userId = UUIDv4();
        console.log("🆔 Creating peer with ID:", userId);
        
        const newPeer = new Peer(userId, {
            host: "video-chat-app-backend-zmxi.onrender.com",
            port: 443,
            path: "/peerjs/myapp",
            secure: true,
            config: {
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" },
                    // Add a free TURN server for better connectivity
                    {
                        urls: "turn:openrelay.metered.ca:80",
                        username: "openrelayproject",
                        credential: "openrelayproject"
                    },
                    {
                        urls: "turn:openrelay.metered.ca:443",
                        username: "openrelayproject",
                        credential: "openrelayproject"
                    }
                ],
                // Add these for better stability
                iceTransportPolicy: 'all',
                iceCandidatePoolSize: 10
            }
        });

        // Add peer event listeners for debugging
        newPeer.on('open', (id) => {
            console.log('✅ Peer connection opened with ID:', id);
        });

        newPeer.on('error', (error) => {
            console.error('❌ Peer error:', error);
        });

        newPeer.on('disconnected', () => {
            console.warn('⚠️ Peer disconnected');
        });

        newPeer.on('close', () => {
            console.warn('⚠️ Peer connection closed');
        });

        setUser(newPeer);
        fetchUserFeed();

        const enterRoom = ({ roomId }: { roomId: string }) => {
            console.log("📍 Entering room:", roomId);
            navigate(`/room/${roomId}`);
        }

        socket.on("room-created", enterRoom);
        socket.on("get-users", fetchParticipantList);

        return () => {
            socket.off("room-created", enterRoom);
            socket.off("get-users", fetchParticipantList);
        }
    }, [])

    useEffect(() => {
        if (!user || !stream) {
            console.log("⏳ Waiting for user and stream...", { user: !!user, stream: !!stream });
            return;
        }

        console.log("✅ Setting up peer call handlers");

        // When someone joins the room (you call them)
        socket.on("user-joined", ({ peerId }) => {
            console.log("📞 Calling new peer:", peerId);
            
            const call = user.call(peerId, stream);
            
            call.on("stream", (remoteStream) => {
                console.log("🎥 Received stream from peer:", peerId);
                console.log("Remote stream tracks:", remoteStream.getTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    readyState: t.readyState
                })));
                dispatch(addPeerAction(peerId, remoteStream));
            });

            call.on('close', () => {
                console.log("📴 Call closed with peer:", peerId);
            });

            call.on('error', (error) => {
                console.error("❌ Call error with peer:", peerId, error);
            });
        });

        // When someone calls you (you answer)
        user.on("call", (call) => {
            console.log("📞 Receiving call from:", call.peer);
            
            call.answer(stream);
            console.log("✅ Answered call with local stream");
            
            call.on("stream", (remoteStream) => {
                console.log("🎥 Received stream from caller:", call.peer);
                console.log("Remote stream tracks:", remoteStream.getTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    readyState: t.readyState
                })));
                dispatch(addPeerAction(call.peer, remoteStream));
            });

            call.on('close', () => {
                console.log("📴 Call closed with caller:", call.peer);
            });

            call.on('error', (error) => {
                console.error("❌ Call error with caller:", call.peer, error);
            });
        });

        console.log("📡 Emitting ready signal");


        return () => {
            socket.off("user-joined");
            user.removeAllListeners("call");
        }
    }, [user, stream])

    return (
        <SocketContext.Provider value={{ socket, user, stream, peers }}>
            {children}
        </SocketContext.Provider>
    ) 
}