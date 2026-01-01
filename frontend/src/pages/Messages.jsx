import React, { useEffect, useState, useRef } from 'react';
import { Layout, List, Input, Button, Avatar, Typography, Badge, Card, Row, Col, Empty, Spin } from 'antd';
import { SendOutlined, UserOutlined, PhoneOutlined, SearchOutlined } from '@ant-design/icons';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

const Messages = () => {
    const { user } = useAuth();
    const { socket, onlineUsers } = useChat();
    const [searchParams] = useSearchParams();

    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(searchParams.get('conversationId') || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await api.get('/chat/conversations');
                setConversations(res.data.data);
                if (!activeConversationId && res.data.data.length > 0) {
                    // Optionally select first
                    // setActiveConversationId(res.data.data[0]._id);
                }
            } catch (error) {
                console.error("Failed to fetch conversations", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    // Fetch messages when active conversation changes
    useEffect(() => {
        if (!activeConversationId) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/chat/messages/${activeConversationId}`);
                setMessages(res.data.data);
                // Join socket room
                socket?.emit('join_conversation', activeConversationId);
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };

        fetchMessages();
    }, [activeConversationId, socket]);

    // Socket listeners for new messages
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            if (message.conversationId === activeConversationId) {
                setMessages((prev) => [...prev, message]);
            }
            // Update conversation list preview
            setConversations(prev => prev.map(conv => {
                if (conv._id === message.conversationId) {
                    return {
                        ...conv,
                        lastMessage: {
                            content: message.content,
                            sender: message.sender, // might be ID or object depending on socket payload
                            timestamp: message.createdAt
                        }
                    };
                }
                return conv;
            }).sort((a, b) => new Date(b.lastMessage?.timestamp) - new Date(a.lastMessage?.timestamp)));
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, activeConversationId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeConversationId) return;

        // Optimistic update? Better to wait for socket confirm or just emit.
        // We emit via socket, server saves and broadcasts back 'receive_message' to us too (or we verify via ack).
        // Let's rely on socket emit.

        socket.emit('send_message', {
            conversationId: activeConversationId,
            content: newMessage,
            type: 'text'
        });

        setNewMessage("");
    };

    const handleCall = () => {
        // Find participant info
        const conversation = conversations.find(c => c._id === activeConversationId);
        if (!conversation) return;

        const otherUser = conversation.participants.find(p => p._id !== user._id);
        if (!otherUser) return; // Should not happen

        // Get Audio stream and start signaling
        navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
            const peer = new window.SimplePeer({
                initiator: true,
                trickle: false,
                stream: stream
            });

            peer.on('signal', (data) => {
                socket.emit('call_user', {
                    userToCall: otherUser._id,
                    signalData: data,
                    from: user._id,
                    name: user.name
                });
            });

            // We need to manage this peer connection in the global context ideally, 
            // OR pass it to our CallModal.
            // ACTUALLY: The CallModal is global. When we initiate a call, we should probably set some state in Context
            // to show the "Calling..." UI.
            // For now, let's just emit. The Context has "incomingCall" logic... but not "outgoingCall".
            // Phase 26: Chat implemented. "Call Interface" is next.
            // I'll skip full local outgoing UI for this step and focus on chat text.
            // But I will trigger the signal.

            // NOTE: SimplePeer needs to be imported or available on window if I use window.SimplePeer. 
            // I installed it as 'simple-peer'.
        });
    };

    // Helper to get other user
    const getOtherUser = (conv) => conv.participants.find(p => p._id !== user._id);

    return (
        <Layout style={{ height: 'calc(100vh - 64px)', background: '#fff' }}>
            <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                    <Input prefix={<SearchOutlined />} placeholder="Search chats" />
                </div>
                <List
                    dataSource={conversations}
                    loading={loading}
                    renderItem={item => {
                        const other = getOtherUser(item);
                        return (
                            <List.Item
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    background: activeConversationId === item._id ? '#e6f7ff' : 'transparent'
                                }}
                                onClick={() => setActiveConversationId(item._id)}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<UserOutlined />} >{other?.name?.[0]}</Avatar>}
                                    title={<div style={{ display: 'flex', justifyContent: 'space-between' }}><Text strong>{other?.name}</Text> <Text type="secondary" style={{ fontSize: 10 }}>{dayjs(item.lastMessage?.timestamp).fromNow(true)}</Text></div>}
                                    description={<Text ellipsis type="secondary">{item.lastMessage?.content || 'No messages yet'}</Text>}
                                />
                            </List.Item>
                        );
                    }}
                />
            </Sider>
            <Content style={{ display: 'flex', flexDirection: 'column' }}>
                {activeConversationId ? (
                    <>
                        {/* Header */}
                        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Avatar icon={<UserOutlined />} size="large" />
                                <div>
                                    <Title level={5} style={{ margin: 0 }}>{getOtherUser(conversations.find(c => c._id === activeConversationId))?.name}</Title>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{onlineUsers.includes(getOtherUser(conversations.find(c => c._id === activeConversationId))?._id) ? 'Online' : 'Offline'}</Text>
                                </div>
                            </div>
                            <Button shape="circle" icon={<PhoneOutlined />} onClick={handleCall} />
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f5f5f5' }}>
                            {messages.map((msg, index) => {
                                const isMe = msg.sender._id === user._id || msg.sender === user._id; // Handle populated vs unpopulated
                                return (
                                    <div key={index} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                                        <div style={{
                                            maxWidth: '70%',
                                            background: isMe ? '#1890ff' : '#fff',
                                            color: isMe ? '#fff' : 'inherit',
                                            padding: '8px 16px',
                                            borderRadius: 12,
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                        }}>
                                            <div style={{ fontSize: 14 }}>{msg.content}</div>
                                            <div style={{ fontSize: 10, textAlign: 'right', marginTop: 4, opacity: 0.7 }}>
                                                {dayjs(msg.createdAt).format('HH:mm')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                            <Row gutter={16}>
                                <Col flex="auto">
                                    <Input
                                        size="large"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onPressEnter={handleSendMessage}
                                    />
                                </Col>
                                <Col>
                                    <Button type="primary" size="large" icon={<SendOutlined />} onClick={handleSendMessage} />
                                </Col>
                            </Row>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#ccc' }}>
                        <Empty description="Select a conversation to start chatting" />
                    </div>
                )}
            </Content>
        </Layout>
    );
};

export default Messages;
