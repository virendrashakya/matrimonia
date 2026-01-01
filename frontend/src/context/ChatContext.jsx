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
    const [typingUsers, setTypingUsers] = useState({}); // { conversationId: [ {userId, name} ] }
    const [incomingCall, setIncomingCall] = useState(null);
    const [outgoingCall, setOutgoingCall] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [userStream, setUserStream] = useState(null);

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const BASE_URL = SOCKET_URL.replace('/api', '');

    useEffect(() => {
        let newSocket;
        if (user && token) {
            newSocket = io(BASE_URL, {
                auth: { token },
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));

            newSocket.on('notification', (data) => {
                if (data.type === 'new_message') {
                    notification.info({
                        message: `New message from ${data.message.sender?.name || 'User'}`,
                        description: data.message.content,
                        onClick: () => { window.location.href = `/messages?conversationId=${data.conversationId}`; }
                    });
                }
            });

            newSocket.on('get_online_users', (users) => setOnlineUsers(users));

            newSocket.on('user_typing', ({ conversationId, userId, name }) => {
                setTypingUsers(prev => {
                    const current = prev[conversationId] || [];
                    if (!current.find(u => u.userId === userId)) {
                        return { ...prev, [conversationId]: [...current, { userId, name }] };
                    }
                    return prev;
                });
            });

            newSocket.on('user_stop_typing', ({ conversationId, userId }) => {
                setTypingUsers(prev => {
                    const current = prev[conversationId] || [];
                    return { ...prev, [conversationId]: current.filter(u => u.userId !== userId) };
                });
            });

            newSocket.on('call_user', ({ from, name: callerName, signal }) => {
                console.log("Receiving call from:", callerName, from);
                setIncomingCall({ from, name: callerName, signal });
            });

            newSocket.on('call_accepted', (signal) => {
                console.log("Call accepted, signal received");
                setCallAccepted(true);
                // We'll use a signal state to pass this to the Peer in CallModal
                setOutgoingCall(prev => prev ? { ...prev, signal } : null);
            });

            newSocket.on('call_ended', () => {
                console.log("Call ended event received");
                setIncomingCall(null);
                setOutgoingCall(null);
                setCallAccepted(false);
                if (userStream) {
                    userStream.getTracks().forEach(track => track.stop());
                    setUserStream(null);
                }
            });

            newSocket.on('call_error', (error) => {
                console.error("Signal Call error:", error);
                notification.error({
                    message: 'Call Failed',
                    description: error
                });
                setOutgoingCall(null);
            });

            setSocket(newSocket);
        }
        return () => { if (newSocket) newSocket.disconnect(); };
    }, [user, token, BASE_URL, userStream]);

    const initiateCall = async (recipientId, recipientName) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            setUserStream(stream);
            setOutgoingCall({ to: recipientId, name: recipientName, isOutgoing: true });
            // The actual Peer initiation will happen in CallModal or here.
            // Let's do it in CallModal to keep it contained.
        } catch (err) {
            console.error("Failed to get media stream", err);
            notification.error({ message: "Could not start call", description: "Microphone access denied." });
        }
    };

    const answerCall = () => {
        setCallAccepted(true);
    };

    const endCall = () => {
        if (socket) {
            const targetId = incomingCall?.from || outgoingCall?.to;
            if (targetId) socket.emit('call_ended', { to: targetId });
        }
        setIncomingCall(null);
        setOutgoingCall(null);
        setCallAccepted(false);
        if (userStream) {
            userStream.getTracks().forEach(track => track.stop());
            setUserStream(null);
        }
    };

    const value = {
        socket,
        onlineUsers,
        typingUsers,
        incomingCall,
        outgoingCall,
        callAccepted,
        userStream,
        initiateCall,
        answerCall,
        endCall,
        setIncomingCall,
        setOutgoingCall,
        setCallAccepted
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
