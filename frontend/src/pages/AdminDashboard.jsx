import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Spin, Progress } from 'antd';
import {
    UserOutlined,
    IdcardOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    LoginOutlined
} from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

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
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!analytics) {
        return <Text type="danger">Failed to load analytics</Text>;
    }

    const loginColumns = [
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const colors = { admin: 'red', moderator: 'purple', matchmaker: 'orange', individual: 'blue' };
                return <Tag color={colors[role] || 'default'}>{role}</Tag>;
            }
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
            render: (ip) => <Text code>{ip || '-'}</Text>
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            render: (time) => new Date(time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
        }
    ];

    const { overview, charts, recentActivity } = analytics;

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>Dashboard Overview</Title>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={8} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Total Users"
                            value={overview.totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Total Profiles"
                            value={overview.totalProfiles}
                            prefix={<IdcardOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Active Today"
                            value={overview.activeToday}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Pending Users"
                            value={overview.pendingVerificationUsers}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card size="small">
                        <Statistic
                            title="Pending Profiles"
                            value={overview.pendingVerificationProfiles}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#fa541c' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title="📊 Registrations (Last 7 Days)" size="small">
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                            {charts.registrationTimeline.map((day, idx) => (
                                <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                                    <div
                                        style={{
                                            height: `${Math.max(10, (day.count / Math.max(...charts.registrationTimeline.map(d => d.count))) * 80)}px`,
                                            background: 'linear-gradient(180deg, #1890ff, #69c0ff)',
                                            borderRadius: 4,
                                            marginBottom: 4
                                        }}
                                    />
                                    <Text style={{ fontSize: 10 }}>{day.date.slice(5)}</Text>
                                    <br />
                                    <Text strong style={{ fontSize: 12 }}>{day.count}</Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="👤 Profiles by Gender" size="small">
                        <Row gutter={16}>
                            <Col span={12}>
                                <div style={{ textAlign: 'center' }}>
                                    <Progress
                                        type="circle"
                                        percent={Math.round((charts.profilesByGender.male || 0) / overview.totalProfiles * 100)}
                                        format={() => charts.profilesByGender.male || 0}
                                        strokeColor="#1890ff"
                                        size={80}
                                    />
                                    <div style={{ marginTop: 8 }}>👨 Male</div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ textAlign: 'center' }}>
                                    <Progress
                                        type="circle"
                                        percent={Math.round((charts.profilesByGender.female || 0) / overview.totalProfiles * 100)}
                                        format={() => charts.profilesByGender.female || 0}
                                        strokeColor="#eb2f96"
                                        size={80}
                                    />
                                    <div style={{ marginTop: 8 }}>👩 Female</div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Profile Status */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={8}>
                    <Card title="📋 Profiles by Status" size="small">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Tag color="green">Approved</Tag>
                                <Text strong>{charts.profilesByStatus.approved || 0}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Tag color="orange">Pending</Tag>
                                <Text strong>{charts.profilesByStatus.pending || 0}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Tag color="red">Rejected</Tag>
                                <Text strong>{charts.profilesByStatus.rejected || 0}</Text>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card
                        title={<><LoginOutlined /> Recent Logins</>}
                        size="small"
                    >
                        <Table
                            columns={loginColumns}
                            dataSource={recentActivity.logins.slice(0, 5).map((l, i) => ({ ...l, key: i }))}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminDashboard;
