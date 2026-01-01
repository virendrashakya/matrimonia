import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Tag, Spin, Progress, Avatar } from 'antd';
import {
    UserOutlined,
    IdcardOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    RiseOutlined
} from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

// Metronic-inspired dark theme colors
const colors = {
    bgDark: '#0F172A',
    bgCard: '#1E293B',
    border: '#334155',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    primary: '#3B82F6',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    cyan: '#06B6D4'
};

// Stat Card Component
function StatCard({ title, value, icon, color, trend, trendValue }) {
    return (
        <Card
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                height: '100%'
            }}
            bodyStyle={{ padding: 20 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>{title}</Text>
                    <Title level={2} style={{ color: colors.textPrimary, margin: '8px 0 4px 0' }}>
                        {value}
                    </Title>
                    {trend && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {trend === 'up' ? (
                                <ArrowUpOutlined style={{ color: colors.success, fontSize: 12 }} />
                            ) : (
                                <ArrowDownOutlined style={{ color: colors.danger, fontSize: 12 }} />
                            )}
                            <Text style={{ color: trend === 'up' ? colors.success : colors.danger, fontSize: 12 }}>
                                {trendValue}
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>vs last week</Text>
                        </div>
                    )}
                </div>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}

// Mini Chart Component
function MiniChart({ data, color }) {
    const max = Math.max(...data.map(d => d.count), 1);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
            {data.map((day, idx) => (
                <div
                    key={idx}
                    style={{
                        flex: 1,
                        height: `${Math.max(8, (day.count / max) * 100)}%`,
                        background: `linear-gradient(180deg, ${color} 0%, ${color}60 100%)`,
                        borderRadius: 3,
                        transition: 'height 0.3s ease'
                    }}
                />
            ))}
        </div>
    );
}

function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/admin/analytics');
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!analytics) {
        return <Text style={{ color: colors.danger }}>Failed to load analytics</Text>;
    }

    const { overview, charts, recentActivity } = analytics;

    const loginColumns = [
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar size="small" style={{ background: colors.primary }}>
                        {record.user?.charAt(0)?.toUpperCase() || '?'}
                    </Avatar>
                    <Text style={{ color: colors.textPrimary }}>{record.user || 'Unknown'}</Text>
                </div>
            )
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const roleColors = {
                    admin: colors.danger,
                    moderator: colors.purple,
                    matchmaker: colors.warning,
                    individual: colors.primary
                };
                return (
                    <Tag
                        style={{
                            background: `${roleColors[role] || colors.textMuted}20`,
                            color: roleColors[role] || colors.textMuted,
                            border: 'none',
                            borderRadius: 6
                        }}
                    >
                        {role || 'user'}
                    </Tag>
                );
            }
        },
        {
            title: 'IP Address',
            dataIndex: 'ip',
            key: 'ip',
            render: (ip) => (
                <Text style={{ color: colors.textMuted, fontFamily: 'monospace', fontSize: 12 }}>
                    {ip || '—'}
                </Text>
            )
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            render: (time) => (
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    {new Date(time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </Text>
            )
        }
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ color: colors.textPrimary, margin: 0 }}>
                    Dashboard
                </Title>
                <Text style={{ color: colors.textMuted }}>
                    Welcome back! Here's what's happening today.
                </Text>
            </div>

            {/* Stats Grid */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Total Users"
                        value={overview.totalUsers}
                        icon={<TeamOutlined style={{ fontSize: 24, color: colors.primary }} />}
                        color={colors.primary}
                        trend="up"
                        trendValue="12%"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Total Profiles"
                        value={overview.totalProfiles}
                        icon={<IdcardOutlined style={{ fontSize: 24, color: colors.success }} />}
                        color={colors.success}
                        trend="up"
                        trendValue="8%"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Active Today"
                        value={overview.activeToday}
                        icon={<RiseOutlined style={{ fontSize: 24, color: colors.cyan }} />}
                        color={colors.cyan}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Pending Verification"
                        value={overview.pendingVerificationProfiles}
                        icon={<ClockCircleOutlined style={{ fontSize: 24, color: colors.warning }} />}
                        color={colors.warning}
                    />
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* Registration Chart */}
                <Col xs={24} lg={14}>
                    <Card
                        style={{
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 12
                        }}
                        bodyStyle={{ padding: 20 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div>
                                <Text style={{ color: colors.textPrimary, fontWeight: 600 }}>
                                    User Registrations
                                </Text>
                                <Text style={{ color: colors.textMuted, display: 'block', fontSize: 12 }}>
                                    Last 7 days
                                </Text>
                            </div>
                            <Tag style={{ background: `${colors.success}20`, color: colors.success, border: 'none' }}>
                                <ArrowUpOutlined /> Active
                            </Tag>
                        </div>
                        <div style={{ height: 160 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                                {charts.registrationTimeline.map((day, idx) => {
                                    const max = Math.max(...charts.registrationTimeline.map(d => d.count), 1);
                                    return (
                                        <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                                            <div
                                                style={{
                                                    height: `${Math.max(16, (day.count / max) * 100)}px`,
                                                    background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primary}60 100%)`,
                                                    borderRadius: 6,
                                                    marginBottom: 8,
                                                    transition: 'height 0.3s'
                                                }}
                                            />
                                            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                                                {day.date.slice(5)}
                                            </Text>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Profile Stats */}
                <Col xs={24} lg={10}>
                    <Card
                        style={{
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 12,
                            height: '100%'
                        }}
                        bodyStyle={{ padding: 20 }}
                    >
                        <Text style={{ color: colors.textPrimary, fontWeight: 600 }}>
                            Profile Status
                        </Text>
                        <div style={{ marginTop: 24 }}>
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ color: colors.textMuted }}>Approved</Text>
                                    <Text style={{ color: colors.success }}>{charts.profilesByStatus.approved || 0}</Text>
                                </div>
                                <Progress
                                    percent={Math.round((charts.profilesByStatus.approved || 0) / overview.totalProfiles * 100)}
                                    strokeColor={colors.success}
                                    trailColor={colors.border}
                                    showInfo={false}
                                />
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ color: colors.textMuted }}>Pending</Text>
                                    <Text style={{ color: colors.warning }}>{charts.profilesByStatus.pending || 0}</Text>
                                </div>
                                <Progress
                                    percent={Math.round((charts.profilesByStatus.pending || 0) / overview.totalProfiles * 100)}
                                    strokeColor={colors.warning}
                                    trailColor={colors.border}
                                    showInfo={false}
                                />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ color: colors.textMuted }}>Rejected</Text>
                                    <Text style={{ color: colors.danger }}>{charts.profilesByStatus.rejected || 0}</Text>
                                </div>
                                <Progress
                                    percent={Math.round((charts.profilesByStatus.rejected || 0) / overview.totalProfiles * 100)}
                                    strokeColor={colors.danger}
                                    trailColor={colors.border}
                                    showInfo={false}
                                />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Recent Logins Table */}
            <Card
                style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12
                }}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
                    <Text style={{ color: colors.textPrimary, fontWeight: 600 }}>
                        Recent Logins
                    </Text>
                </div>
                <Table
                    columns={loginColumns}
                    dataSource={recentActivity.logins.slice(0, 8).map((l, i) => ({ ...l, key: i }))}
                    pagination={false}
                    size="small"
                    style={{ background: 'transparent' }}
                />
            </Card>

            {/* Custom dark table styles */}
            <style>{`
                .ant-table {
                    background: transparent !important;
                }
                .ant-table-thead > tr > th {
                    background: ${colors.bgDark} !important;
                    color: ${colors.textMuted} !important;
                    border-bottom: 1px solid ${colors.border} !important;
                    font-weight: 500 !important;
                    font-size: 12px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                .ant-table-tbody > tr > td {
                    background: transparent !important;
                    border-bottom: 1px solid ${colors.border} !important;
                }
                .ant-table-tbody > tr:hover > td {
                    background: rgba(255,255,255,0.03) !important;
                }
            `}</style>
        </div>
    );
}

export default AdminDashboard;
