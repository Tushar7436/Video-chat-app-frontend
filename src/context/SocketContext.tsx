import SocketClient from "socket.io-client"
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import {v4 as UUIDv4 } from "uuid";

const WS_Server = "http://localhost:5500";

export const SocketContext = createContext<any | null>(null); 

const socket = SocketClient(WS_Server);


interface Props {
    children: React.ReactNode
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
    const navigate = useNavigate(); //will help to progeamtically handle navigation

    //state variable to store the userId
    const [user, setUser] = useState<Peer>(); //new peer user
    const [stream, setStream] = useState<MediaStream>();


    const fetchUserFeed = async() => {
        const stream = await navigator.mediaDevices.getUserMedia({ video : true, audio: true});
        setStream(stream);
    }

    useEffect(() => {

        const userId = UUIDv4();
        const newPeer = new Peer(userId,{
            host:"localhost",
            port:9000,
            path: "/myapp"
        });

        setUser(newPeer);

        fetchUserFeed();

        const enterRoom = ({ roomId }:{ roomId: string}) => {
            navigate(`/room/${roomId}`)
        }

        //we will transfer the user to the room page when we collect an event of room-created from server
        socket.on("room-created", enterRoom)

    },[])
    return (
        <SocketContext.Provider value ={{ socket, user, stream }}>
            {children}
        </SocketContext.Provider>
    ) 
}