import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";

const Room: React.FC =() =>{

    const { id } = useParams();
    const { socket,user } = useContext(SocketContext);

    const fetchparticipants = ({roomId, participants}: {roomId: string, participants: string[]}) => {
        console.log("fetched room participants");
        console.log(roomId,participants);
    }

    useEffect(() => {
        // emitting this event so that either creator of room or joiner in the room
        // anyone is added the server knows that new person have been added to this room 
        if(user) {
            console.log("New user joined with id", user._id, "has joined room", id);
            socket.emit("joined-room", {roomId:id, peerId: user._id});
            socket.on('get-users', fetchparticipants);
        }
    },[id, user]);

    return(
        <div>
            room: {id};
        </div>
        
    )
}

export default Room;