import { useEffect, useState } from "react";
import styled from "styled-components";
import { useConnection, useSocket } from "../hooks/useSocket";

// a short hiccup, or the first moment after opening, is not worth a message
const SHOW_AFTER_MS = 1500;

const NotConnectedBar = styled.div`
  position: fixed;
  top: var(--navigationHeight);
  left: 0;
  width: 100%;
  z-index: 1200;
  padding: 8px 16px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1b1b1b;
  background-color: var(--orange-status, #f08c1e);
`;

/**
 * Keeps the connection with KweenB and tells when it is gone
 */
export function SocketConnectionManager() {
  const { connect } = useSocket();
  const connected = useConnection((state) => state.connected);
  const [showNotConnected, setShowNotConnected] = useState(false);

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    if (connected) {
      setShowNotConnected(false);
      return undefined;
    }
    const timer = setTimeout(() => setShowNotConnected(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [connected]);

  if (!showNotConnected) return null;
  return (
    <NotConnectedBar role="status">
      Not connected to KweenB. Trying again… Buttons do nothing until the
      connection is back.
    </NotConnectedBar>
  );
}
