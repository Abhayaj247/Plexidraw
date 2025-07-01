import { useEffect, useRef, useCallback } from 'react';
import { DrawingElement } from '../types/canvas';

export type DrawingEvent =
  | { type: 'drawing_create'; drawing: DrawingElement; roomId: number }
  | { type: 'drawing_update'; drawing: DrawingElement; roomId: number }
  | { type: 'drawing_delete'; drawingId: string; roomId: number };

export type ChatEvent = {
  type: 'chat';
  roomId: number;
  message: string;
  username?: string;
  userId?: string;
};

export type WebSocketEvent = DrawingEvent | ChatEvent;

interface UseDrawingSocketProps {
  token: string;
  roomId: number;
  onDrawingEvent: (event: DrawingEvent) => void;
  onChatEvent?: (event: ChatEvent) => void;
}

export function useDrawingSocket({ 
  token, 
  roomId, 
  onDrawingEvent,
  onChatEvent 
}: UseDrawingSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = token ? 
      `ws://localhost:8080?token=${token}` : 
      'ws://localhost:8080';
      
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join_room', roomId }));
      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketEvent;
        if (
          data.type === 'drawing_create' ||
          data.type === 'drawing_update' ||
          data.type === 'drawing_delete'
        ) {
          onDrawingEvent(data);
        } else if (data.type === 'chat' && onChatEvent) {
          onChatEvent(data);
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };
  }, [token, roomId, onDrawingEvent, onChatEvent]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const sendEvent = useCallback((event: WebSocketEvent) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ ...event, roomId }));
    }
  }, [roomId]);

  const isConnected = useCallback(() => {
    return wsRef.current?.readyState === WebSocket.OPEN;
  }, []);

  return { 
    sendEvent,
    sendDrawingEvent: (event: DrawingEvent) => sendEvent(event),
    sendChatMessage: (message: string) => 
      sendEvent({ type: 'chat', message, roomId }),
    isConnected
  };
} 