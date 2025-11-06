"use client";

import { useEffect, useState, useRef } from "react";

interface UsePresenceResult {
  count: number;
  isConnected: boolean;
}

const PING_INTERVAL_MS = 15000; // 15 seconds

/**
 * Hook to track real-time presence count for a subject
 * Opens SSE connection and sends periodic pings
 */
export function usePresence(
  subject: string | null | undefined
): UsePresenceResult {
  const [count, setCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip if no subject
    if (!subject || subject.trim().length === 0) {
      setCount(0);
      setIsConnected(false);
      return;
    }

    const subjectKey = subject.trim();
    let isActive = true;

    // Set up SSE connection
    const eventSource = new EventSource(
      `/api/presence/stream?subject=${encodeURIComponent(subjectKey)}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      if (isActive) {
        setIsConnected(true);
      }
    };

    eventSource.onmessage = (event) => {
      if (!isActive) return;

      try {
        const data = JSON.parse(event.data);
        if (typeof data.count === "number") {
          setCount(data.count);
        }
      } catch (error) {
        console.error("[usePresence] Failed to parse SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[usePresence] SSE error:", error);
      if (isActive) {
        setIsConnected(false);
        // EventSource will automatically try to reconnect
        // The onopen handler will set isConnected back to true when it reconnects
      }
    };

    // Send periodic pings
    const sendPing = async () => {
      if (!isActive) return;

      try {
        await fetch("/api/presence/ping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject: subjectKey }),
        });
      } catch (error) {
        console.error("[usePresence] Ping failed:", error);
      }
    };

    // Send initial ping
    sendPing();

    // Set up ping interval
    pingIntervalRef.current = setInterval(sendPing, PING_INTERVAL_MS);

    // Cleanup
    return () => {
      isActive = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      setIsConnected(false);
      setCount(0);
    };
  }, [subject]);

  return { count, isConnected };
}
