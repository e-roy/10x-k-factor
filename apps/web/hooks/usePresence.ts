"use client";

import { useEffect, useState, useRef } from "react";

interface UsePresenceResult {
  count: number;
  isConnected: boolean;
  health?: "healthy" | "degraded";
}

const PING_INTERVAL_MS = 15000; // 15 seconds
const INITIAL_BACKOFF_MS = 1000; // 1 second
const MAX_BACKOFF_MS = 30000; // 30 seconds
const CIRCUIT_BREAKER_FAILURES = 5; // After 5 failures, enter circuit breaker
const CIRCUIT_BREAKER_WAIT_MS = 60000; // Wait 60s before retry in circuit breaker
const ERROR_SUPPRESSION_MS = 60000; // Suppress error logs for 60s

/**
 * Hook to track real-time presence count for a subject
 * Opens SSE connection and sends periodic pings
 */
export function usePresence(
  subject: string | null | undefined
): UsePresenceResult {
  const [count, setCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [health, setHealth] = useState<"healthy" | "degraded">("healthy");
  const eventSourceRef = useRef<EventSource | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveFailuresRef = useRef(0);
  const backoffMsRef = useRef(INITIAL_BACKOFF_MS);
  const lastErrorLogTimeRef = useRef(0);
  const isCircuitBreakerOpenRef = useRef(false);

  useEffect(() => {
    // Skip if no subject
    if (!subject || subject.trim().length === 0) {
      setCount(0);
      setIsConnected(false);
      setHealth("healthy");
      return;
    }

    const subjectKey = subject.trim();
    let isActive = true;

    const logError = (message: string, error?: unknown) => {
      const now = Date.now();
      if (now - lastErrorLogTimeRef.current < ERROR_SUPPRESSION_MS) {
        return; // Suppress repeated errors
      }
      lastErrorLogTimeRef.current = now;
      if (error) {
        console.error(`[usePresence] ${message}:`, error);
      } else {
        console.error(`[usePresence] ${message}`);
      }
    };

    const connect = () => {
      if (!isActive) return;

      // Check circuit breaker
      if (isCircuitBreakerOpenRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isActive) {
            isCircuitBreakerOpenRef.current = false;
            consecutiveFailuresRef.current = 0;
            backoffMsRef.current = INITIAL_BACKOFF_MS;
            connect();
          }
        }, CIRCUIT_BREAKER_WAIT_MS);
        return;
      }

      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Set up SSE connection
      const eventSource = new EventSource(
        `/api/presence/stream?subject=${encodeURIComponent(subjectKey)}`
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (isActive) {
          setIsConnected(true);
          // Reset on successful connection
          consecutiveFailuresRef.current = 0;
          backoffMsRef.current = INITIAL_BACKOFF_MS;
          isCircuitBreakerOpenRef.current = false;
        }
      };

      eventSource.onmessage = (event) => {
        if (!isActive) return;

        try {
          const data = JSON.parse(event.data);
          if (typeof data.count === "number") {
            setCount(data.count);
          }
          if (data.health === "healthy" || data.health === "degraded") {
            setHealth(data.health);
          }
        } catch (error) {
          logError("Failed to parse SSE data", error);
        }
      };

      eventSource.onerror = (_error) => {
        if (!isActive) return;

        setIsConnected(false);
        consecutiveFailuresRef.current++;

        // Enter circuit breaker after N consecutive failures
        if (consecutiveFailuresRef.current >= CIRCUIT_BREAKER_FAILURES) {
          isCircuitBreakerOpenRef.current = true;
          logError(
            `Circuit breaker opened after ${consecutiveFailuresRef.current} failures`
          );
          // Will reconnect after CIRCUIT_BREAKER_WAIT_MS
          connect();
          return;
        }

        // Close and reconnect with exponential backoff
        eventSource.close();

        // Calculate backoff (exponential with max cap)
        const backoff = Math.min(
          backoffMsRef.current *
            Math.pow(2, consecutiveFailuresRef.current - 1),
          MAX_BACKOFF_MS
        );
        backoffMsRef.current = backoff;

        logError(`Connection failed, retrying in ${backoff}ms`);

        reconnectTimeoutRef.current = setTimeout(() => {
          if (isActive) {
            connect();
          }
        }, backoff);
      };
    };

    // Initial connection
    connect();

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
        // Ping failures are non-critical, don't log unless it's the first
        if (consecutiveFailuresRef.current === 0) {
          logError("Ping failed", error);
        }
      }
    };

    // Send initial ping after a short delay
    const initialPingTimeout = setTimeout(sendPing, 1000);

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
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (initialPingTimeout) {
        clearTimeout(initialPingTimeout);
      }
      setIsConnected(false);
      setCount(0);
      setHealth("healthy");
      // Reset state
      consecutiveFailuresRef.current = 0;
      backoffMsRef.current = INITIAL_BACKOFF_MS;
      isCircuitBreakerOpenRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  return { count, isConnected, health };
}
