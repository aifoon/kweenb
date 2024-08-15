import { useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

export function SocketConnectionManager() {
  const { connect, disconnect } = useSocket();

  useEffect(() => {
    // connect with socket.io
    connect();

    // cleanup
    return () => {
      disconnect();
    };
  }, []);

  return <></>;
}
