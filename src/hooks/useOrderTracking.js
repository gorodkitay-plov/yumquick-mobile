import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

const WS_URL = 'ws://172.30.1.71:8080/ws-native';

export function useOrderTracking(orderId) {
    const [location, setLocation] = useState(null);
    const [connected, setConnected] = useState(false);
    const clientRef = useRef(null);

    useEffect(() => {
        if (!orderId) return;

        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/tracking/${orderId}`, (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        setLocation(data);
                    } catch {}
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: () => setConnected(false),
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [orderId]);

    return { location, connected };
}