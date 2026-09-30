import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface WSNotification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  data?: any;
}

interface WebSocketContextType {
  isConnected: boolean;
  notifications: WSNotification[];
  refreshTrigger: number;
  clearNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  notifications: [],
  refreshTrigger: 0,
  clearNotifications: () => {}
});

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WSNotification[]>([
    {
      id: 'init-1',
      type: 'INFO',
      message: 'Command Center Live Telemetry Initialized: 35 PHCs synchronized.',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 'init-2',
      type: 'WARNING',
      message: 'Paracetamol stock at PHC Cuttack Rural projected to breach minimum buffer in 4 days.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString()
    }
  ]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        const wsUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')
          .replace('http://', 'ws://')
          .replace('https://', 'wss://') + '/api/ws';

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.event && parsed.event !== 'PONG') {
              const newNotif: WSNotification = {
                id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                type: parsed.event.includes('CRITICAL') || parsed.event.includes('SIMULATION') ? 'CRITICAL' : 'INFO',
                message: parsed.data?.message || parsed.message || `System event: ${parsed.event}`,
                timestamp: new Date().toLocaleTimeString(),
                data: parsed.data
              };
              setNotifications(prev => [newNotif, ...prev].slice(0, 20));
              setRefreshTrigger(prev => prev + 1);
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws?.close();
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, notifications, refreshTrigger, clearNotifications }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);

