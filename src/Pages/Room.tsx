import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import UserFeedPlayer from "../components/UserFeedPlayer";

const Room: React.FC =() =>{

    const { id } = useParams();
    const { socket,user, stream, peers } = useContext(SocketContext);

    const fetchparticipants = ({roomId, participants}: {roomId: string, participants: string[]}) => {
        console.log("fetched room participants");
        console.log(roomId,participants);
    }
    console.log("Current peers state:", peers);
    useEffect(() => {
        // emitting this event so that either creator of room or joiner in the room
        // anyone is added the server knows that new person have been added to this room 
        if(user) {
            console.log("New user joined with id", user._id, "has joined room", id);
            socket.emit("joined-room", {roomId:id, peerId: user._id});
            socket.on('get-users', fetchparticipants);
        }
    },[id, user,socket]);

    return(
        <div>
            Creater feed
            <br/>
            room: {id}
            <UserFeedPlayer stream ={stream} />
            <div>
                Other users feed
                {Object.keys(peers).map((peerId) => (
                    <div key = {peerId}>
                        <UserFeedPlayer stream = {peers[peerId].stream}/>
                    </div>
                ))}
            </div>
        </div>
        
    )
}

export default Room;