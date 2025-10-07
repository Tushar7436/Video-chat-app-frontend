import { useEffect, useRef } from "react";

interface UserFeedPlayerProps {
    stream?: MediaStream;
    muted?: boolean;
}

const UserFeedPlayer: React.FC<UserFeedPlayerProps> = ({ stream, muted = false }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            console.log("Setting video srcObject:", {
                streamId: stream.id,
                tracks: stream.getTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    readyState: t.readyState
                }))
            });
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={videoRef}
            style={{
                width: '300px',
                height: '200px',
                backgroundColor: '#000',
                borderRadius: '4px'
            }}
            muted={muted}
            autoPlay
            playsInline // Important for mobile devices
        />
    )
}

export default UserFeedPlayer;