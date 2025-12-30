import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Statistic, Button, Spin, Empty, Space, Tag, Alert, Tabs, Badge } from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    HeartOutlined,
    UserAddOutlined,
    SafetyCertificateOutlined,
    CrownOutlined,
    SettingOutlined,
    FlagOutlined,
    ShopOutlined,
    ImportOutlined,
    EyeOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProfileCard from '../components/ProfileCard';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Role-specific labels
const roleLabels = {
    admin: { label: 'Administrator', labelHi: 'प्रशासक', icon: '👑' },
    moderator: { label: 'Moderator', labelHi: 'मॉडरेटर', icon: '🛡️' },
    matchmaker: { label: 'Matchmaker', labelHi: 'मैचमेकर', icon: '💍' },
    elder: { label: 'Elder', labelHi: 'बड़े-बुज़ुर्ग', icon: '🙏' },
    helper: { label: 'Helper', labelHi: 'सहायक', icon: '🤝' },
    contributor: { label: 'Contributor', labelHi: 'योगदानकर्ता', icon: '👤' }
};

function Dashboard() {
    const { user, isVerified, isElder } = useAuth();
    const { t, language } = useLanguage();
    const [recentProfiles, setRecentProfiles] = useState([]);
    const [myProfiles, setMyProfiles] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const isHindi = language === 'hi';
    const isAdmin = user?.role === 'admin';
    const isModerator = user?.role === 'moderator';
    const isMatchmaker = user?.role === 'matchmaker';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [profilesRes, myProfilesRes, recommendationsRes, statsRes] = await Promise.all([
                api.get('/profiles?limit=6'),
                api.get('/user/my-profiles?limit=6'),
                api.get('/user/recommendations?limit=6'),
                api.get('/user/dashboard-stats')
            ]);

            setRecentProfiles(profilesRes.data.data?.profiles || []);
            setMyProfiles(myProfilesRes.data.profiles || []);
            setRecommendations(recommendationsRes.data.recommendations || []);
            setDashboardStats(statsRes.data.stats || {});
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

    const roleInfo = roleLabels[user?.role] || roleLabels.contributor;

    // Role-specific quick actions
    const getQuickActions = () => {
        const commonActions = [
            {
                key: 'add',
                path: '/profiles/new',
                icon: <UserAddOutlined />,
                title: t.dashboard.addProfile,
                subtitle: t.dashboard.createBiodata
            },
            {
                key: 'search',
                path: '/search',
                icon: <SearchOutlined />,
                title: t.dashboard.search,
                subtitle: t.dashboard.findMatches
            },
            {
                key: 'profiles',
                path: '/profiles',
                icon: <TeamOutlined />,
                title: t.dashboard.allProfiles,
                subtitle: `${dashboardStats?.totalProfiles || recentProfiles.length} ${t.dashboard.activeProfiles}`
            },
        ];

        if (isAdmin) {
            return [
                ...commonActions,
                {
                    key: 'admin',
                    path: '/admin',
                    icon: <SettingOutlined />,
                    title: isHindi ? 'एडमिन पैनल' : 'Admin Panel',
                    subtitle: isHindi ? 'उपयोगकर्ता और सेटिंग्स' : 'Users & Settings'
                },
            ];
        }

        if (isElder) {
            return [
                ...commonActions,
                {
                    key: 'import',
                    path: '/import',
                    icon: <ImportOutlined />,
                    title: t.nav.import,
                    subtitle: isHindi ? 'WhatsApp से आयात' : 'Import from WhatsApp'
                },
            ];
        }

        return commonActions;
    };

    return (
        <div style={{ padding: '32px 0' }}>
            {/* Welcome Section */}
            <Card
                style={{
                    marginBottom: 24,
                    background: 'linear-gradient(135deg, #A0153E 0%, #7A0F2E 100%)',
                    borderRadius: 12,
                    border: 'none',
                    overflow: 'hidden',
                    position: 'relative',
                }}
                styles={{ body: { padding: '20px 24px' } }}
            >
                <div style={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.1)',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Title level={3} style={{ color: 'white', margin: 0, fontSize: 20 }}>
                                {t.dashboard.namaste}, {user?.name?.split(' ')[0]}! 🙏
                            </Title>
                            <Tag
                                style={{
                                    background: 'rgba(212, 175, 55, 0.2)',
                                    border: 'none',
                                    color: '#F4D160',
                                    fontSize: 11,
                                    borderRadius: 12,
                                    margin: 0
                                }}
                            >
                                {roleInfo.icon} {isHindi ? roleInfo.labelHi : roleInfo.label}
                            </Tag>
                        </div>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '4px 0 0 0' }}>
                            {t.dashboard.welcome}
                        </Paragraph>
                    </div>

                    <div>
                        {isVerified ? (
                            <Tag style={{
                                background: '#FFFFFF',
                                border: 'none',
                                borderRadius: 20,
                                padding: '4px 12px',
                                color: '#059669',
                                fontSize: 12,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                margin: 0
                            }}>
                                <CheckCircleOutlined /> {t.dashboard.verifiedMember}
                            </Tag>
                        ) : (
                            <Tag style={{
                                background: 'rgba(217, 119, 6, 0.2)',
                                border: '1px solid rgba(217, 119, 6, 0.3)',
                                borderRadius: 20,
                                padding: '4px 12px',
                                color: '#FDE68A',
                                fontSize: 12,
                                margin: 0
                            }}>
                                {t.dashboard.awaitingVerification}
                            </Tag>
                        )}
                    </div>
                </div>
            </Card>

            {/* Admin/Moderator Alert Stats */}
            {(isAdmin || isModerator) && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    {isAdmin && dashboardStats?.pendingVerifications > 0 && (
                        <Col xs={24} sm={12}>
                            <Alert
                                message={
                                    <Link to="/admin" style={{ color: 'inherit' }}>
                                        <Space>
                                            <ClockCircleOutlined />
                                            <span>
                                                {dashboardStats.pendingVerifications} {isHindi ? 'सत्यापन लंबित' : 'pending verifications'}
                                            </span>
                                        </Space>
                                    </Link>
                                }
                                type="warning"
                                showIcon={false}
                                style={{ borderRadius: 8 }}
                            />
                        </Col>
                    )}
                    {isModerator && dashboardStats?.flaggedProfiles > 0 && (
                        <Col xs={24} sm={12}>
                            <Alert
                                message={
                                    <Space>
                                        <FlagOutlined />
                                        <span>
                                            {dashboardStats.flaggedProfiles} {isHindi ? 'फ़्लैग किए गए प्रोफ़ाइल' : 'flagged profiles need review'}
                                        </span>
                                    </Space>
                                }
                                type="error"
                                showIcon={false}
                                style={{ borderRadius: 8 }}
                            />
                        </Col>
                    )}
                </Row>
            )}

            {/* Quick Actions */}
            <Row gutter={24} style={{ marginBottom: 40 }}>
                {getQuickActions().map(action => (
                    <Col xs={24} sm={12} md={6} key={action.key} style={{ marginBottom: 16 }}>
                        <Link to={action.path}>
                            <Card hoverable style={{ textAlign: 'center', borderRadius: 12, height: '100%' }} styles={{ body: { padding: 24 } }}>
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
                                    {React.cloneElement(action.icon, { style: { fontSize: 24, color: '#A0153E' } })}
                                </div>
                                <Title level={4} style={{ marginBottom: 4 }}>{action.title}</Title>
                                <Text type="secondary">{action.subtitle}</Text>
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>

            {/* Stats Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #D4AF37', height: '100%' }}>
                        <Statistic
                            title={<Text style={{ color: '#8B7355' }}>{isHindi ? 'मेरी प्रोफ़ाइल' : 'My Profiles'}</Text>}
                            value={dashboardStats?.myProfiles || 0}
                            prefix={<TeamOutlined style={{ color: '#D4AF37' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #A0153E', height: '100%' }}>
                        <Statistic
                            title={<Text style={{ color: '#8B7355' }}>{isHindi ? 'दी गई पहचान' : 'Recognitions Given'}</Text>}
                            value={dashboardStats?.myRecognitions || 0}
                            prefix={<HeartOutlined style={{ color: '#A0153E' }} />}
                        />
                    </Card>
                </Col>
                {isAdmin && (
                    <>
                        <Col xs={12} sm={6}>
                            <Card style={{ borderRadius: 12, borderLeft: '4px solid #059669', height: '100%' }}>
                                <Statistic
                                    title={<Text style={{ color: '#8B7355' }}>{isHindi ? 'कुल उपयोगकर्ता' : 'Total Users'}</Text>}
                                    value={dashboardStats?.totalUsers || 0}
                                    prefix={<CrownOutlined style={{ color: '#059669' }} />}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card style={{ borderRadius: 12, borderLeft: '4px solid #7C3AED', height: '100%' }}>
                                <Statistic
                                    title={<Text style={{ color: '#8B7355' }}>{isHindi ? 'कुल प्रोफ़ाइल' : 'Total Profiles'}</Text>}
                                    value={dashboardStats?.totalProfiles || 0}
                                    prefix={<TeamOutlined style={{ color: '#7C3AED' }} />}
                                />
                            </Card>
                        </Col>
                    </>
                )}
                {isMatchmaker && (
                    <>
                        <Col xs={12} sm={6}>
                            <Card style={{ borderRadius: 12, borderLeft: '4px solid #059669', height: '100%' }}>
                                <Statistic
                                    title={<Text style={{ color: '#8B7355' }}>{isHindi ? 'कुल क्लाइंट' : 'Total Clients'}</Text>}
                                    value={dashboardStats?.totalClients || 0}
                                    prefix={<ShopOutlined style={{ color: '#059669' }} />}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card style={{ borderRadius: 12, borderLeft: '4px solid #F59E0B' }}>
                                <Statistic
                                    title={<Text style={{ color: '#8B7355' }}>{isHindi ? 'सफल मिलान' : 'Matched'}</Text>}
                                    value={dashboardStats?.matchedProfiles || 0}
                                    prefix={<HeartOutlined style={{ color: '#F59E0B' }} />}
                                />
                            </Card>
                        </Col>
                    </>
                )}
                {!isAdmin && !isMatchmaker && (
                    <>
                        <Col xs={12} sm={6}>
                            <Card style={{ borderRadius: 12, borderLeft: '4px solid #059669' }}>
                                <Statistic
                                    title={<Text style={{ color: '#8B7355' }}>{t.dashboard.totalProfiles}</Text>}
                                    value={recentProfiles.length}
                                    prefix={<SafetyCertificateOutlined style={{ color: '#059669' }} />}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card style={{ borderRadius: 12, borderLeft: '4px solid #7C3AED' }}>
                                <Statistic
                                    title={<Text style={{ color: '#8B7355' }}>{t.dashboard.activeMatches}</Text>}
                                    value={0}
                                    prefix={<HeartOutlined style={{ color: '#7C3AED' }} />}
                                />
                            </Card>
                        </Col>
                    </>
                )}
            </Row>

            {/* Tabbed Content */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                size="large"
                style={{ marginBottom: 24 }}
            >
                <TabPane
                    tab={
                        <span>
                            <EyeOutlined /> {isHindi ? 'हाल की प्रोफ़ाइल' : 'Recent Profiles'}
                        </span>
                    }
                    key="overview"
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Title level={4} style={{ margin: 0 }}>{t.dashboard.recentProfiles}</Title>
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
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <Badge count={myProfiles.length} size="small" offset={[8, 0]}>
                                <TeamOutlined /> {isHindi ? 'मेरी प्रोफ़ाइल' : 'My Profiles'}
                            </Badge>
                        </span>
                    }
                    key="my-profiles"
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Title level={4} style={{ margin: 0 }}>{isHindi ? 'मेरी बनाई प्रोफ़ाइल' : 'Profiles I Created'}</Title>
                        <Link to="/profiles/new">
                            <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 8 }}>
                                {t.dashboard.addProfile}
                            </Button>
                        </Link>
                    </div>

                    {myProfiles.length > 0 ? (
                        <div className="profile-grid">
                            {myProfiles.map(profile => (
                                <ProfileCard key={profile._id} profile={profile} showEdit />
                            ))}
                        </div>
                    ) : (
                        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
                            <Empty
                                image={<div style={{ fontSize: 64 }}>📝</div>}
                                description={
                                    <Space direction="vertical">
                                        <Title level={4} style={{ color: '#8B7355' }}>
                                            {isHindi ? 'आपने अभी तक कोई प्रोफ़ाइल नहीं बनाई' : 'You haven\'t created any profiles yet'}
                                        </Title>
                                        <Text type="secondary">
                                            {isHindi ? 'परिवार या मित्र की शादी के लिए प्रोफ़ाइल जोड़ें' : 'Add a profile for family or friends looking for a match'}
                                        </Text>
                                    </Space>
                                }
                            >
                                <Link to="/profiles/new">
                                    <Button type="primary" icon={<PlusOutlined />}>{t.dashboard.addFirstProfile}</Button>
                                </Link>
                            </Empty>
                        </Card>
                    )}
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <HeartOutlined /> {isHindi ? 'सुझाव' : 'Recommendations'}
                        </span>
                    }
                    key="recommendations"
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Title level={4} style={{ margin: 0 }}>
                            {isHindi ? 'आपके लिए सुझाई गई प्रोफ़ाइल' : 'Recommended for You'}
                        </Title>
                        <Link to="/search">
                            <Button type="primary" ghost style={{ borderRadius: 8 }}>
                                <SearchOutlined /> {isHindi ? 'और खोजें' : 'Search More'}
                            </Button>
                        </Link>
                    </div>

                    {recommendations.length > 0 ? (
                        <div className="profile-grid">
                            {recommendations.map(profile => (
                                <ProfileCard key={profile._id} profile={profile} />
                            ))}
                        </div>
                    ) : (
                        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
                            <Empty
                                image={<div style={{ fontSize: 64 }}>💫</div>}
                                description={
                                    <Space direction="vertical">
                                        <Title level={4} style={{ color: '#8B7355' }}>
                                            {isHindi ? 'अभी कोई सुझाव नहीं' : 'No recommendations yet'}
                                        </Title>
                                        <Text type="secondary">
                                            {isHindi ? 'प्रोफ़ाइल ब्राउज़ करें और पहचान दें' : 'Browse profiles and give recognitions to get personalized suggestions'}
                                        </Text>
                                    </Space>
                                }
                            >
                                <Link to="/profiles">
                                    <Button type="primary" icon={<SearchOutlined />}>
                                        {isHindi ? 'प्रोफ़ाइल देखें' : 'Browse Profiles'}
                                    </Button>
                                </Link>
                            </Empty>
                        </Card>
                    )}
                </TabPane>
            </Tabs>
        </div>
    );
}

export default Dashboard;
