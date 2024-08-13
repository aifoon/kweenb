import { useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

export function SocketConnectionManager() {
  const { connect, disconnect } = useSocket();

  useEffect(() => {
    // connect with socket.io
    connect();

    /**
     * Whenever the page is changed, navigate to the new page
     */
    // socket.on('change-page', (payload) => {
    //   navigate(`/${payload}`);
    // })

    // cleanup
    return () => {
      // socket.off('change-page');
      disconnect();
    };
  }, []);

  return <></>;
}
