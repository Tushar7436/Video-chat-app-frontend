import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";


const CreateRoom: React.FC = () => {

    const { socket } = useContext(SocketContext);

    const initRoom = () => {
        socket.emit("create-room");
        console.log("send request to initialise a request", socket);
    }
    return (
        <button 
            onClick ={initRoom}
            className="btn btn-secondary"
        >
            Start a new meeting in a new room
        </button>
    )
}

export default CreateRoom;