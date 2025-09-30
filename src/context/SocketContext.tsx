import SocketClient from "socket.io-client"
import { createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WS_Server = "http://localhost:5500";

export const SocketContext = createContext<any | null>(null); 

const socket = SocketClient(WS_Server);


interface Props {
    children: React.ReactNode
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
    const navigate = useNavigate(); //will help to progeamtically handle navigation

    useEffect(() => {

        const enterRoom = ({ roomId }:{ roomId: string}) => {
            navigate(`/room/${roomId}`)
        }

        //we will transfer the user to the room page when we collect an event of room-created from server
        socket.on("room-created", enterRoom)
    })
    return (
        <SocketContext.Provider value ={{ socket }}>
            {children}
        </SocketContext.Provider>
    ) 
}