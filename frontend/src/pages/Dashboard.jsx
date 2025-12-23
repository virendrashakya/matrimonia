import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Statistic, Button, Spin, Empty, Space } from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    HeartOutlined,
    UserAddOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProfileCard from '../components/ProfileCard';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;

function Dashboard() {
    const { user, isVerified } = useAuth();
    const { t } = useLanguage();
    const [recentProfiles, setRecentProfiles] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/profiles?limit=6');
            setRecentProfiles(response.data.data.profiles);
            setStats({ total: response.data.data.pagination.total });
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 0' }}>
            {/* Welcome Section */}
            <Card
                style={{
                    marginBottom: 32,
                    background: 'linear-gradient(135deg, #A0153E 0%, #7A0F2E 100%)',
                    borderRadius: 16,
                    border: 'none',
                    overflow: 'hidden',
                    position: 'relative',
                }}
                bodyStyle={{ padding: 32 }}
            >
                <div style={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.1)',
                }} />

                <Row align="middle" gutter={24}>
                    <Col flex="auto">
                        <Title level={2} style={{ color: 'white', margin: 0 }}>
                            {t.dashboard.namaste}, {user?.name}! 🙏
                        </Title>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, margin: '8px 0 0 0' }}>
                            {t.dashboard.welcome}
                        </Paragraph>
                    </Col>
                    <Col>
                        {isVerified ? (
                            <div style={{
                                background: 'rgba(5, 150, 105, 0.2)',
                                border: '1px solid rgba(5, 150, 105, 0.4)',
                                borderRadius: 12,
                                padding: '12px 20px',
                                color: '#A7F3D0',
                            }}>
                                <CheckCircleOutlined /> {t.dashboard.verifiedMember}
                            </div>
                        ) : (
                            <div style={{
                                background: 'rgba(217, 119, 6, 0.2)',
                                border: '1px solid rgba(217, 119, 6, 0.4)',
                                borderRadius: 12,
                                padding: '12px 20px',
                                color: '#FDE68A',
                            }}>
                                {t.dashboard.awaitingVerification}
                            </div>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* Quick Actions */}
            <Row gutter={24} style={{ marginBottom: 40 }}>
                <Col xs={24} sm={8}>
                    <Link to="/profiles/new">
                        <Card hoverable style={{ textAlign: 'center', borderRadius: 12, height: '100%' }} bodyStyle={{ padding: 24 }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FFF5EB, #FFE4CC)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <UserAddOutlined style={{ fontSize: 24, color: '#A0153E' }} />
                            </div>
                            <Title level={4} style={{ marginBottom: 4 }}>{t.dashboard.addProfile}</Title>
                            <Text type="secondary">{t.dashboard.createBiodata}</Text>
                        </Card>
                    </Link>
                </Col>
                <Col xs={24} sm={8}>
                    <Link to="/search">
                        <Card hoverable style={{ textAlign: 'center', borderRadius: 12, height: '100%' }} bodyStyle={{ padding: 24 }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FFF5EB, #FFE4CC)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <SearchOutlined style={{ fontSize: 24, color: '#A0153E' }} />
                            </div>
                            <Title level={4} style={{ marginBottom: 4 }}>{t.dashboard.search}</Title>
                            <Text type="secondary">{t.dashboard.findMatches}</Text>
                        </Card>
                    </Link>
                </Col>
                <Col xs={24} sm={8}>
                    <Link to="/profiles">
                        <Card hoverable style={{ textAlign: 'center', borderRadius: 12, height: '100%' }} bodyStyle={{ padding: 24 }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FFF5EB, #FFE4CC)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <TeamOutlined style={{ fontSize: 24, color: '#A0153E' }} />
                            </div>
                            <Title level={4} style={{ marginBottom: 4 }}>{t.dashboard.allProfiles}</Title>
                            <Text type="secondary">{stats?.total || 0} {t.dashboard.activeProfiles}</Text>
                        </Card>
                    </Link>
                </Col>
            </Row>

            {/* Stats Row */}
            <Row gutter={24} style={{ marginBottom: 40 }}>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #D4AF37' }}>
                        <Statistic
                            title={<Text style={{ color: '#8B7355' }}>{t.dashboard.totalProfiles}</Text>}
                            value={stats?.total || 0}
                            prefix={<TeamOutlined style={{ color: '#D4AF37' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #A0153E' }}>
                        <Statistic
                            title={<Text style={{ color: '#8B7355' }}>{t.dashboard.activeMatches}</Text>}
                            value={0}
                            prefix={<HeartOutlined style={{ color: '#A0153E' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #059669' }}>
                        <Statistic
                            title={<Text style={{ color: '#8B7355' }}>{t.dashboard.verifiedProfilesCount}</Text>}
                            value={0}
                            prefix={<SafetyCertificateOutlined style={{ color: '#059669' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Recent Profiles */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>{t.dashboard.recentProfiles}</Title>
                    <Link to="/profiles">
                        <Button type="primary" ghost style={{ borderRadius: 8 }}>{t.dashboard.viewAll} →</Button>
                    </Link>
                </div>

                {recentProfiles.length > 0 ? (
                    <div className="profile-grid">
                        {recentProfiles.map(profile => (
                            <ProfileCard key={profile._id} profile={profile} />
                        ))}
                    </div>
                ) : (
                    <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
                        <Empty
                            image={<div style={{ fontSize: 64 }}>💍</div>}
                            description={
                                <Space direction="vertical">
                                    <Title level={4} style={{ color: '#8B7355' }}>{t.dashboard.noProfiles}</Title>
                                    <Text type="secondary">{t.dashboard.beFirst}</Text>
                                </Space>
                            }
                        >
                            <Link to="/profiles/new">
                                <Button type="primary" icon={<PlusOutlined />}>{t.dashboard.addFirstProfile}</Button>
                            </Link>
                        </Empty>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
