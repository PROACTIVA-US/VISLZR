import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketMessage } from '@/types/websocket';

export const useWebSocket = (
  projectId: string | null,
  onMessage?: (message: WebSocketMessage) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!projectId) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/ws?project_id=${projectId}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);

      // Auto-reconnect with exponential backoff
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(
            `Reconnecting... (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`
          );
          reconnectAttemptsRef.current += 1;
          connect();
        }, delay);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };

    wsRef.current = ws;
  }, [projectId, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const send = useCallback((message: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [projectId, connect, disconnect]);

  return { isConnected, send, disconnect };
};