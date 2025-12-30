/**
 * Interests Page - View and manage sent/received interests and matches
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Card, Tabs, List, Avatar, Button, Tag, Empty, Spin, Typography,
    Space, Badge, message, Modal, Input, Row, Col
} from 'antd';
import {
    HeartOutlined,
    SendOutlined,
    InboxOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    HeartFilled,
    PhoneOutlined,
    StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;

const { TextArea } = Input;

function InterestsPage() {
    const { user } = useAuth();
    const { isHindi } = useLanguage();

    const [activeTab, setActiveTab] = useState('received');
    const [sentInterests, setSentInterests] = useState([]);
    const [receivedInterests, setReceivedInterests] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [respondingId, setRespondingId] = useState(null);
    const [responseMessage, setResponseMessage] = useState('');

    useEffect(() => {
        fetchAllInterests();
    }, []);

    const fetchAllInterests = async () => {
        setLoading(true);
        try {
            const [sentRes, receivedRes, matchesRes] = await Promise.all([
                api.get('/interests/sent'),
                api.get('/interests/received'),
                api.get('/interests/matches')
            ]);

            setSentInterests(sentRes.data.interests || []);
            setReceivedInterests(receivedRes.data.interests || []);
            setMatches(matchesRes.data.matches || []);
        } catch (error) {
            console.error('Error fetching interests:', error);
            message.error(isHindi ? 'रुचियाँ लोड करने में त्रुटि' : 'Error loading interests');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (interestId, action) => {
        try {
            await api.put(`/interests/${interestId}/respond`, {
                action,
                message: responseMessage
            });
            message.success(
                action === 'accept'
                    ? (isHindi ? 'रुचि स्वीकार की गई!' : 'Interest accepted!')
                    : (isHindi ? 'रुचि अस्वीकार की गई' : 'Interest declined')
            );
            setRespondingId(null);
            setResponseMessage('');
            fetchAllInterests();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to respond');
        }
    };

    const getStatusTag = (status) => {
        const config = {
            pending: { color: 'processing', label: isHindi ? 'प्रतीक्षारत' : 'Pending' },
            accepted: { color: 'success', label: isHindi ? 'स्वीकृत' : 'Accepted' },
            rejected: { color: 'error', label: isHindi ? 'अस्वीकृत' : 'Declined' },
            withdrawn: { color: 'default', label: isHindi ? 'वापस लिया' : 'Withdrawn' }
        };
        const cfg = config[status] || config.pending;
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
    };

    const getPhoto = (profile) => {
        return profile?.photos?.find(p => p.isPrimary)?.url || profile?.photos?.[0]?.url;
    };

    const pendingCount = receivedInterests.filter(i => i.status === 'pending').length;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 0' }}>
            {/* Header */}
            <Card
                style={{
                    marginBottom: 32,
                    background: 'linear-gradient(135deg, #A0153E 0%, #7A0F2E 100%)',
                    borderRadius: 16,
                    border: 'none',
                }}
                styles={{ body: { padding: 32 } }}
            >
                <Row align="middle" gutter={24}>
                    <Col flex="auto">
                        <Title level={2} style={{ color: 'white', margin: 0 }}>
                            <HeartFilled style={{ marginRight: 12 }} />
                            {isHindi ? 'मेरी रुचियाँ' : 'My Interests'}
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                            {isHindi
                                ? 'पसंद करें, जुड़ें और अपना साथी खोजें'
                                : 'Express interest, connect, and find your match'}
                        </Text>
                    </Col>
                    <Col>
                        <Space size={16}>
                            <div style={{ textAlign: 'center', color: 'white' }}>
                                <div style={{ fontSize: 24, fontWeight: 600 }}>{matches.length}</div>
                                <div style={{ fontSize: 12, opacity: 0.8 }}>{isHindi ? 'मैच' : 'Matches'}</div>
                            </div>
                            <div style={{ textAlign: 'center', color: 'white' }}>
                                <div style={{ fontSize: 24, fontWeight: 600 }}>{sentInterests.length}</div>
                                <div style={{ fontSize: 12, opacity: 0.8 }}>{isHindi ? 'भेजी गई' : 'Sent'}</div>
                            </div>
                            <div style={{ textAlign: 'center', color: 'white' }}>
                                <div style={{ fontSize: 24, fontWeight: 600 }}>{receivedInterests.length}</div>
                                <div style={{ fontSize: 12, opacity: 0.8 }}>{isHindi ? 'प्राप्त' : 'Received'}</div>
                            </div>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                size="large"
                tabBarStyle={{ marginBottom: 24 }}
                items={[
                    {
                        key: 'received',
                        label: (
                            <Badge count={pendingCount} offset={[10, 0]}>
                                <span><InboxOutlined /> {isHindi ? 'प्राप्त रुचियाँ' : 'Received'}</span>
                            </Badge>
                        ),
                        children: receivedInterests.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={receivedInterests}
                                renderItem={(interest) => (
                                    <Card
                                        style={{ marginBottom: 16, borderRadius: 12 }}
                                        styles={{ body: { padding: 16 } }}
                                    >
                                        <List.Item
                                            actions={
                                                interest.status === 'pending' ? [
                                                    <Button
                                                        type="primary"
                                                        icon={<CheckCircleOutlined />}
                                                        onClick={() => handleRespond(interest._id, 'accept')}
                                                    >
                                                        {isHindi ? 'स्वीकारें' : 'Accept'}
                                                    </Button>,
                                                    <Button
                                                        danger
                                                        icon={<CloseCircleOutlined />}
                                                        onClick={() => handleRespond(interest._id, 'reject')}
                                                    >
                                                        {isHindi ? 'अस्वीकार' : 'Decline'}
                                                    </Button>
                                                ] : [getStatusTag(interest.status)]
                                            }
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Link to={`/profiles/${interest.fromProfile?._id}`}>
                                                        <Avatar
                                                            size={64}
                                                            src={getPhoto(interest.fromProfile)}
                                                            icon={<UserOutlined />}
                                                            style={{ backgroundColor: '#E5D4C0' }}
                                                        />
                                                    </Link>
                                                }
                                                title={
                                                    <Link to={`/profiles/${interest.fromProfile?._id}`}>
                                                        <Space>
                                                            <Text strong style={{ fontSize: 16 }}>
                                                                {interest.fromProfile?.fullName}
                                                            </Text>
                                                            <Text type="secondary">
                                                                {interest.fromProfile?.gender === 'male' ? '♂️' : '♀️'}
                                                            </Text>
                                                        </Space>
                                                    </Link>
                                                }
                                                description={
                                                    <Space direction="vertical" size={4}>
                                                        <Text type="secondary">
                                                            {interest.fromProfile?.age} {isHindi ? 'वर्ष' : 'yrs'} • {interest.fromProfile?.city}
                                                        </Text>
                                                        {interest.message && (
                                                            <Text italic style={{ color: '#8B7355' }}>
                                                                "{interest.message}"
                                                            </Text>
                                                        )}
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {new Date(interest.createdAt).toLocaleDateString()}
                                                        </Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    </Card>
                                )}
                            />
                        ) : (
                            <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
                                <Empty
                                    image={<div style={{ fontSize: 64 }}>💌</div>}
                                    description={
                                        <Space direction="vertical">
                                            <Title level={4} style={{ color: '#8B7355' }}>
                                                {isHindi ? 'कोई नई रुचियाँ नहीं' : 'No interests received yet'}
                                            </Title>
                                            <Text type="secondary">
                                                {isHindi
                                                    ? 'जब कोई आपकी प्रोफ़ाइल में रुचि लेगा, वह यहाँ दिखाई देगी'
                                                    : 'When someone expresses interest in your profile, it will appear here'}
                                            </Text>
                                        </Space>
                                    }
                                />
                            </Card>
                        )
                    },
                    {
                        key: 'sent',
                        label: <span><SendOutlined /> {isHindi ? 'भेजी गई रुचियाँ' : 'Sent'}</span>,
                        children: sentInterests.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={sentInterests}
                                renderItem={(interest) => (
                                    <Card
                                        style={{ marginBottom: 16, borderRadius: 12 }}
                                        styles={{ body: { padding: 16 } }}
                                    >
                                        <List.Item
                                            actions={[getStatusTag(interest.status)]}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Link to={`/profiles/${interest.toProfile?._id}`}>
                                                        <Avatar
                                                            size={64}
                                                            src={getPhoto(interest.toProfile)}
                                                            icon={<UserOutlined />}
                                                            style={{ backgroundColor: '#E5D4C0' }}
                                                        />
                                                    </Link>
                                                }
                                                title={
                                                    <Link to={`/profiles/${interest.toProfile?._id}`}>
                                                        <Space>
                                                            <Text strong style={{ fontSize: 16 }}>
                                                                {interest.toProfile?.fullName}
                                                            </Text>
                                                            <Text type="secondary">
                                                                {interest.toProfile?.gender === 'male' ? '♂️' : '♀️'}
                                                            </Text>
                                                        </Space>
                                                    </Link>
                                                }
                                                description={
                                                    <Space direction="vertical" size={4}>
                                                        <Text type="secondary">
                                                            {interest.toProfile?.city}
                                                        </Text>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {isHindi ? 'भेजा गया' : 'Sent'}: {new Date(interest.createdAt).toLocaleDateString()}
                                                        </Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    </Card>
                                )}
                            />
                        ) : (
                            <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
                                <Empty
                                    image={<div style={{ fontSize: 64 }}>💝</div>}
                                    description={
                                        <Space direction="vertical">
                                            <Title level={4} style={{ color: '#8B7355' }}>
                                                {isHindi ? 'कोई रुचियाँ नहीं भेजी' : 'No interests sent yet'}
                                            </Title>
                                            <Text type="secondary">
                                                {isHindi
                                                    ? 'प्रोफ़ाइल ब्राउज़ करें और अपनी पसंद का प्रोफ़ाइल खोजें'
                                                    : 'Browse profiles and express interest in ones you like'}
                                            </Text>
                                        </Space>
                                    }
                                >
                                    <Link to="/profiles">
                                        <Button type="primary">
                                            {isHindi ? 'प्रोफ़ाइल देखें' : 'Browse Profiles'}
                                        </Button>
                                    </Link>
                                </Empty>
                            </Card>
                        )
                    },
                    {
                        key: 'matches',
                        label: (
                            <Badge count={matches.length} style={{ backgroundColor: '#059669' }} offset={[10, 0]}>
                                <span><HeartFilled style={{ color: '#A0153E' }} /> {isHindi ? 'मैच' : 'Matches'}</span>
                            </Badge>
                        ),
                        children: matches.length > 0 ? (
                            <Row gutter={[16, 16]}>
                                {matches.map((match) => (
                                    <Col xs={24} sm={12} md={8} key={match.profile?._id}>
                                        <Card
                                            hoverable
                                            style={{ borderRadius: 12, overflow: 'hidden' }}
                                            cover={
                                                <div style={{ position: 'relative' }}>
                                                    {getPhoto(match.profile) ? (
                                                        <img
                                                            alt={match.profile?.fullName}
                                                            src={getPhoto(match.profile)}
                                                            style={{ height: 200, width: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            height: 200,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'linear-gradient(135deg, #FFF5EB, #FFF8F0)'
                                                        }}>
                                                            <Avatar size={80} icon={<UserOutlined />} />
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        right: 12,
                                                        background: 'linear-gradient(135deg, #059669, #047857)',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: 16,
                                                        fontSize: 12,
                                                        fontWeight: 600
                                                    }}>
                                                        <StarOutlined /> {isHindi ? 'मैच!' : 'Match!'}
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <Card.Meta
                                                title={
                                                    <Link to={`/profiles/${match.profile?._id}`}>
                                                        {match.profile?.fullName}
                                                    </Link>
                                                }
                                                description={
                                                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                        <Text>{match.profile?.age} {isHindi ? 'वर्ष' : 'yrs'} • {match.profile?.city}</Text>
                                                        {match.profile?.phone && (
                                                            <Tag color="green" icon={<PhoneOutlined />}>
                                                                {match.profile.phone}
                                                            </Tag>
                                                        )}
                                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                                            {isHindi ? 'मैच किया' : 'Matched'}: {new Date(match.matchedAt).toLocaleDateString()}
                                                        </Text>
                                                    </Space>
                                                }
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ) : (
                            <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
                                <Empty
                                    image={<div style={{ fontSize: 64 }}>💞</div>}
                                    description={
                                        <Space direction="vertical">
                                            <Title level={4} style={{ color: '#8B7355' }}>
                                                {isHindi ? 'अभी तक कोई मैच नहीं' : 'No matches yet'}
                                            </Title>
                                            <Text type="secondary">
                                                {isHindi
                                                    ? 'जब आप और कोई दोनों एक-दूसरे में रुचि लेंगे, तो यह एक मैच होगा!'
                                                    : 'When you and someone both express interest in each other, it\'s a match!'}
                                            </Text>
                                        </Space>
                                    }
                                />
                            </Card>
                        )
                    }
                ]}
            />
        </div>
    );
}

export default InterestsPage;
