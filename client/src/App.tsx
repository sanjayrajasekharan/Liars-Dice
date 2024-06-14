import * as React from "react";
import { io } from "socket.io-client";

export default function App() {
  const URL = "http://localhost:3000";

  const socketRef = React.useRef(io(URL));
  const [isConnected, setIsConnected] = React.useState(
    socketRef.current.connected
  );
  const [webSocketMessage, setWebSocketMessage] = React.useState<string>();

  React.useEffect(() => {
    const socket = socketRef.current;

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onMessage(value: string) {
      setWebSocketMessage(value);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
    };
  }, []);

  return (
    <div className="App">
      <div>Connected: {isConnected ? "Yes" : "No"}</div>
      <div>Message: {webSocketMessage}</div>
      <button onClick={() => socketRef.current.emit("message", "Hello world")}>
        Send message
      </button>
    </div>
  );
}
