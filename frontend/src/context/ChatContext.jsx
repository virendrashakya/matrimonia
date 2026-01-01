import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notification } from 'antd'; // Use Antd calls for notifications

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [incomingCall, setIncomingCall] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);

    // Config
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Remove /api if present for socket connection (socket usually connects to root)
    // Actually typically we want the base URL. If VITE_API_URL is http://localhost:3000/api, we need http://localhost:3000
    const BASE_URL = SOCKET_URL.replace('/api', '');

    useEffect(() => {
        let newSocket;
        if (user && token) {
            newSocket = io(BASE_URL, {
                auth: { token },
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            newSocket.on('notification', (data) => {
                if (data.type === 'new_message') {
                    notification.info({
                        message: `New message from ${data.message.sender?.name || 'User'}`,
                        description: data.message.content,
                        onClick: () => {
                            // Navigate logic would go here, but we are in context
                            // Could expose a way to navigate or just let user click
                        }
                    });
                }
            });

            newSocket.on('call_user', ({ from, name: callerName, signal }) => {
                console.log("Incoming call from", callerName);
                setIncomingCall({
                    isReceivingCall: true,
                    from,
                    name: callerName,
                    signal
                });
            });

            newSocket.on('call_ended', () => {
                setIncomingCall(null);
                setCallAccepted(false);
            });

            setSocket(newSocket);
        }

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [user, token, BASE_URL]);

    const answerCall = () => {
        setCallAccepted(true);
    };

    const rejectCall = () => {
        setIncomingCall(null);
        // Emitting rejection logic could go here
    };

    const value = {
        socket,
        onlineUsers,
        incomingCall,
        callAccepted,
        answerCall,
        rejectCall,
        setIncomingCall,
        setCallAccepted
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
