import React, { useEffect, useState, useRef } from 'react';
import { Layout, List, Input, Button, Avatar, Typography, Badge, Card, Row, Col, Empty, Spin, Grid } from 'antd';
import { SendOutlined, UserOutlined, PhoneOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

const Messages = () => {
    const { user } = useAuth();
    const { socket, onlineUsers, typingUsers, initiateCall } = useChat();
    const [searchParams] = useSearchParams();
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;
    const typingTimeoutRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);

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

        if (socket) {
            socket.emit('send_message', {
                conversationId: activeConversationId,
                content: newMessage,
                type: 'text'
            });
            // Stop typing status immediately on send
            socket.emit('stop_typing', { conversationId: activeConversationId });
            setIsTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }

        setNewMessage("");
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setNewMessage(val);

        if (!socket || !activeConversationId) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', { conversationId: activeConversationId });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { conversationId: activeConversationId });
            setIsTyping(false);
        }, 2000);
    };

    const handleCall = () => {
        const conversation = conversations.find(c => c._id === activeConversationId);
        if (!conversation) return;
        const otherUser = getOtherUser(conversation);
        if (!otherUser) return;

        initiateCall(otherUser._id, otherUser.name);
    };

    // Helper to get other user
    const getOtherUser = (conv) => conv?.participants?.find(p => p._id !== user?._id);

    const activeConversation = conversations.find(c => c._id === activeConversationId);
    const otherUser = getOtherUser(activeConversation);

    return (
        <Layout style={{ flex: 1, background: '#fff', width: '100%', overflow: 'hidden' }}>
            {(!isMobile || !activeConversationId) && (
                <Sider
                    width={isMobile ? '100%' : 300}
                    theme="light"
                    style={{ borderRight: '1px solid #f0f0f0' }}
                >
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
            )}
            {(!isMobile || activeConversationId) && (
                <Content style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
                    {activeConversationId ? (
                        <>
                            {/* Header */}
                            <div style={{
                                padding: isMobile ? '8px 12px' : '12px 16px',
                                borderBottom: '1px solid #f0f0f0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                minHeight: isMobile ? '56px' : '64px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    {isMobile && (
                                        <Button
                                            type="text"
                                            icon={<ArrowLeftOutlined />}
                                            onClick={() => setActiveConversationId(null)}
                                        />
                                    )}
                                    <Avatar icon={<UserOutlined />} size={isMobile ? "small" : "large"} />
                                    <div>
                                        <Title level={5} style={{ margin: 0, fontSize: isMobile ? 14 : 16, lineHeight: 1.2 }}>{otherUser?.name || 'Chat'}</Title>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {typingUsers[activeConversationId]?.length > 0
                                                ? <span style={{ color: '#52c41a', fontStyle: 'italic' }}>Typing...</span>
                                                : (otherUser?._id && onlineUsers.includes(otherUser._id) ? 'Online' : 'Offline')
                                            }
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div style={{
                                flex: 1,
                                padding: isMobile ? '12px' : '20px',
                                overflowY: 'auto',
                                background: '#f5f5f5',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0
                            }}>
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
                            <div style={{ padding: isMobile ? '12px' : '16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                                <Row gutter={16}>
                                    <Col flex="auto">
                                        <Input
                                            size="large"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={handleInputChange}
                                            onPressEnter={handleSendMessage}
                                        />
                                    </Col>
                                    <Col>
                                        <Button type="primary" size="large" icon={<SendOutlined />} onClick={handleSendMessage} />
                                    </Col>
                                </Row>
                            </div>
                        </>
                    ) : !isMobile ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#ccc' }}>
                            <Empty description="Select a conversation to start chatting" />
                        </div>
                    ) : null}
                </Content>
            )}
        </Layout>
    );
};

export default Messages;
