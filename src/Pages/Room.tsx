import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";

const Room: React.FC =() =>{

    const { id } = useParams();
    const { socket } = useContext(SocketContext);

    useEffect(() => {
        // emitting this event so that either creator of room or joiner in the room
        // anyone is added the server knows that new person have been added to this room 
        socket.emit("joined-room", {roomId:id});
    },[]);

    return(
        <div>
            room: {id};
        </div>
        
    )
}

export default Room;