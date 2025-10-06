import SocketClient from "socket.io-client"
import { createContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { v4 as UUIDv4 } from "uuid";
import { peerReducer } from "../Reducers/peerReducer";
import { addPeerAction } from "../Actions/peerAction";

const WS_Server = "https://video-chat-app-backend-zmxi.onrender.com";

export const SocketContext = createContext<any | null>(null); 

const socket = SocketClient(WS_Server, {
    withCredentials: false,
    transports: ["websocket", "polling"]
});

interface Props {
    children: React.ReactNode
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState<Peer>();
    const [stream, setStream] = useState<MediaStream>();
    const [peers, dispatch] = useReducer(peerReducer, {});

    const fetchParticipantList = ({ roomId, participants }: { roomId: string, participants: string[] }) => {
        console.log("Room participants:", roomId, participants);
    }

    const fetchUserFeed = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            setStream(stream);
        } catch (error) {
            console.error("Error getting media:", error);
        }
    }

    useEffect(() => {
        const userId = UUIDv4();
        
        const newPeer = new Peer(userId, {
            host: "video-chat-app-backend-zmxi.onrender.com",
            port: 443,
            path: "/peerjs/myapp",
            secure: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    {
                        urls: 'turn:openrelay.metered.ca:80',
                        username: 'openrelayproject',
                        credential: 'openrelayproject',
                    }
                ]
            }
        });

        setUser(newPeer);
        fetchUserFeed();

        const enterRoom = ({ roomId }: { roomId: string }) => {
            navigate(`/room/${roomId}`);
        }

        socket.on("room-created", enterRoom);
        socket.on("get-users", fetchParticipantList);

        return () => {
            newPeer.destroy();
            stream?.getTracks().forEach(track => track.stop());
        }
    }, [])

    useEffect(() => {
        if (!user || !stream) return;

        socket.on("user-joined", ({ peerId }: { peerId: string }) => {
            const call = user.call(peerId, stream);
            call.on("stream", (remoteStream) => {
                dispatch(addPeerAction(peerId, remoteStream));
            });
        });

        user.on("call", (call) => {
            call.answer(stream);
            call.on("stream", (remoteStream) => {
                dispatch(addPeerAction(call.peer, remoteStream));
            });
        });

        socket.emit("ready");
    }, [user, stream])

    return (
        <SocketContext.Provider value={{ socket, user, stream, peers }}>
            {children}
        </SocketContext.Provider>
    )
}