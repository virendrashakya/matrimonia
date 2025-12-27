/**
 * MatchmakerDashboard - Dashboard for matchmakers to manage their profiles
 */

import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Typography, Statistic, Table, Button, Space, Tag,
    Avatar, Tooltip, Input, Empty, Spin, message, Badge, Dropdown
} from 'antd';
import {
    UserOutlined, HeartOutlined, EyeOutlined, ShareAltOutlined,
    QrcodeOutlined, WhatsAppOutlined, PlusOutlined, SearchOutlined,
    TeamOutlined, TrophyOutlined, CheckCircleOutlined, ClockCircleOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProfileQRCode from '../components/ProfileQRCode';
import WhatsAppShare from '../components/WhatsAppShare';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

function MatchmakerDashboard() {
    const { user } = useAuth();
    const { isHindi } = useLanguage();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);
    const [stats, setStats] = useState({});
    const [searchText, setSearchText] = useState('');

    // Modal states
    const [qrProfile, setQrProfile] = useState(null);
    const [shareProfile, setShareProfile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch user's profiles
            const profilesRes = await api.get('/user/my-profiles');
            const profilesList = profilesRes.data.data?.profiles || [];
            setProfiles(profilesList);

            // Fetch dashboard stats
            const statsRes = await api.get('/user/dashboard-stats');
            setStats(statsRes.data.data || {});

        } catch (error) {
            console.error('Error fetching data:', error);
            message.error(isHindi ? 'डेटा लोड करने में त्रुटि' : 'Error loading data');
        } finally {
            setLoading(false);
        }
    };

    // Filter profiles by search
    const filteredProfiles = profiles.filter(p =>
        p.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.caste?.toLowerCase().includes(searchText.toLowerCase())
    );

    // Table columns
    const columns = [
        {
            title: isHindi ? 'प्रोफ़ाइल' : 'Profile',
            key: 'profile',
            render: (_, record) => (
                <Space>
                    <Avatar
                        src={record.photos?.find(p => p.isPrimary)?.url || record.photos?.[0]?.url}
                        icon={<UserOutlined />}
                        size={48}
                    />
                    <div>
                        <Link to={`/profiles/${record._id}`}>
                            <Text strong style={{ color: '#A0153E' }}>{record.fullName}</Text>
                        </Link>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.age} {isHindi ? 'वर्ष' : 'yrs'} • {record.city}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: isHindi ? 'जाति' : 'Caste',
            dataIndex: 'caste',
            key: 'caste',
            responsive: ['md']
        },
        {
            title: isHindi ? 'स्थिति' : 'Status',
            key: 'status',
            render: (_, record) => {
                const statusConfig = {
                    active: { color: 'success', icon: <CheckCircleOutlined />, label: isHindi ? 'सक्रिय' : 'Active' },
                    matched: { color: 'gold', icon: <HeartOutlined />, label: isHindi ? 'मैच' : 'Matched' },
                    withdrawn: { color: 'default', icon: <ClockCircleOutlined />, label: isHindi ? 'वापस' : 'Withdrawn' }
                };
                const config = statusConfig[record.status] || statusConfig.active;
                return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
            }
        },
        {
            title: isHindi ? 'रुचियाँ' : 'Interests',
            key: 'interests',
            responsive: ['lg'],
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title={isHindi ? 'प्राप्त' : 'Received'}>
                        <Badge count={record.interestsReceived || 0} showZero style={{ backgroundColor: '#52c41a' }}>
                            <HeartOutlined style={{ fontSize: 16 }} />
                        </Badge>
                    </Tooltip>
                </Space>
            )
        },
        {
            title: isHindi ? 'क्रियाएं' : 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size={8}>
                    <Tooltip title={isHindi ? 'देखें' : 'View'}>
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/profiles/${record._id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="QR Code">
                        <Button
                            type="text"
                            icon={<QrcodeOutlined />}
                            onClick={() => setQrProfile(record)}
                        />
                    </Tooltip>
                    <Tooltip title="WhatsApp">
                        <Button
                            type="text"
                            icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
                            onClick={() => setShareProfile(record)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={2} style={{ margin: 0, color: '#A0153E' }}>
                        {isHindi ? '🎯 मैचमेकर डैशबोर्ड' : '🎯 Matchmaker Dashboard'}
                    </Title>
                    <Text type="secondary">
                        {isHindi ? 'अपनी सभी प्रोफ़ाइल प्रबंधित करें' : 'Manage all your profiles'}
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/add-profile')}
                    style={{ background: 'linear-gradient(135deg, #A0153E, #7A0F2E)' }}
                >
                    {isHindi ? 'नई प्रोफ़ाइल' : 'Add Profile'}
                </Button>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card style={{ background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)', border: 'none' }}>
                        <Statistic
                            title={<Text style={{ color: '#E65100' }}>{isHindi ? 'कुल प्रोफ़ाइल' : 'Total Profiles'}</Text>}
                            value={profiles.length}
                            prefix={<TeamOutlined style={{ color: '#FF6B00' }} />}
                            valueStyle={{ color: '#E65100' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', border: 'none' }}>
                        <Statistic
                            title={<Text style={{ color: '#2E7D32' }}>{isHindi ? 'सक्रिय' : 'Active'}</Text>}
                            value={profiles.filter(p => p.status === 'active').length}
                            prefix={<CheckCircleOutlined style={{ color: '#4CAF50' }} />}
                            valueStyle={{ color: '#2E7D32' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ background: 'linear-gradient(135deg, #FCE4EC, #F8BBD9)', border: 'none' }}>
                        <Statistic
                            title={<Text style={{ color: '#C2185B' }}>{isHindi ? 'रुचियाँ प्राप्त' : 'Interests'}</Text>}
                            value={stats.totalInterestsReceived || 0}
                            prefix={<HeartOutlined style={{ color: '#E91E63' }} />}
                            valueStyle={{ color: '#C2185B' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)', border: 'none' }}>
                        <Statistic
                            title={<Text style={{ color: '#F57F17' }}>{isHindi ? 'मैच' : 'Matches'}</Text>}
                            value={stats.totalMatches || 0}
                            prefix={<TrophyOutlined style={{ color: '#FFD700' }} />}
                            valueStyle={{ color: '#F57F17' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Profiles Table */}
            <Card
                title={
                    <Space>
                        <UserOutlined />
                        {isHindi ? 'मेरी प्रोफ़ाइल' : 'My Profiles'}
                        <Tag>{profiles.length}</Tag>
                    </Space>
                }
                extra={
                    <Search
                        placeholder={isHindi ? 'खोजें...' : 'Search...'}
                        style={{ width: 200 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                }
            >
                {profiles.length === 0 ? (
                    <Empty
                        description={isHindi ? 'कोई प्रोफ़ाइल नहीं' : 'No profiles yet'}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => navigate('/add-profile')}>
                            {isHindi ? 'पहली प्रोफ़ाइल बनाएं' : 'Create First Profile'}
                        </Button>
                    </Empty>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredProfiles}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                        style={{ marginTop: -8 }}
                    />
                )}
            </Card>

            {/* Quick Tips for Matchmakers */}
            <Card
                title={isHindi ? '💡 टिप्स' : '💡 Quick Tips'}
                style={{ marginTop: 24, background: 'linear-gradient(135deg, #FFF8F0, #FFFBF5)' }}
            >
                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <div style={{ textAlign: 'center', padding: 16 }}>
                            <QrcodeOutlined style={{ fontSize: 32, color: '#A0153E', marginBottom: 8 }} />
                            <Paragraph style={{ margin: 0 }}>
                                <Text strong>{isHindi ? 'QR कोड' : 'QR Codes'}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {isHindi ? 'प्रिंट करें और शादी समारोहों में बांटें' : 'Print & share at events'}
                                </Text>
                            </Paragraph>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div style={{ textAlign: 'center', padding: 16 }}>
                            <WhatsAppOutlined style={{ fontSize: 32, color: '#25D366', marginBottom: 8 }} />
                            <Paragraph style={{ margin: 0 }}>
                                <Text strong>{isHindi ? 'WhatsApp शेयर' : 'WhatsApp Share'}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {isHindi ? 'फॉर्मेटेड संदेश एक क्लिक में' : 'Formatted messages in one click'}
                                </Text>
                            </Paragraph>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div style={{ textAlign: 'center', padding: 16 }}>
                            <TrophyOutlined style={{ fontSize: 32, color: '#FFD700', marginBottom: 8 }} />
                            <Paragraph style={{ margin: 0 }}>
                                <Text strong>{isHindi ? 'ट्रैक करें' : 'Track Progress'}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {isHindi ? 'रुचियाँ और मैच देखें' : 'Monitor interests & matches'}
                                </Text>
                            </Paragraph>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* QR Code Modal */}
            <ProfileQRCode
                profile={qrProfile}
                visible={!!qrProfile}
                onClose={() => setQrProfile(null)}
            />

            {/* WhatsApp Share Modal */}
            <WhatsAppShare
                profile={shareProfile}
                visible={!!shareProfile}
                onClose={() => setShareProfile(null)}
            />
        </div>
    );
}

export default MatchmakerDashboard;
