/**
 * A simple confirmation state manager
 */

import { useCallback, useEffect, useRef, useState } from "react";

export function useMqtt(topic: string) {
  const [mqttMessages, setMqttMessages] = useState("");

  const mqttMessagesRef = useRef("");

  const clearMessages = useCallback(() => {
    setMqttMessages("");
    mqttMessagesRef.current = "";
  }, [mqttMessages]);

  useEffect(() => {
    window.kweenb.actions.subscribe(topic);
    const removeAllListeners = window.kweenb.events.onMqttMessage(
      (e, t, message) => {
        if (t !== topic) return;
        mqttMessagesRef.current += `${message}\n`;
        setMqttMessages(mqttMessagesRef.current);
      }
    );
    return () => {
      window.kweenb.actions.unsubscribe(topic);
      removeAllListeners();
    };
  }, []);

  return { mqttMessages, clearMessages };
}
