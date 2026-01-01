import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Tag, Table, Spin, Descriptions, Button, Space, Popconfirm, message, Tabs } from 'antd';
import {
    UserOutlined,
    ArrowLeftOutlined,
    IdcardOutlined,
    HistoryOutlined,
    LockOutlined,
    CheckCircleOutlined,
    StopOutlined
} from '@ant-design/icons';
import api from '../services/api';

const { Title, Text } = Typography;

function AdminUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await api.get(`/admin/users/${id}`);
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            message.error('Failed to load user');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async () => {
        try {
            await api.post(`/admin/users/${id}/block`, { reason: 'Blocked by admin' });
            message.success('User blocked');
            fetchUser();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to block user');
        }
    };

    const handleUnblockUser = async () => {
        try {
            await api.post(`/admin/users/${id}/unblock`);
            message.success('User unblocked');
            fetchUser();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to unblock user');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!data) {
        return <Text type="danger">User not found</Text>;
    }

    const { user, profiles, activity, loginHistory } = data;

    const profileColumns = [
        {
            title: 'ID',
            dataIndex: 'customId',
            key: 'customId',
            render: (text, record) => <Link to={`/admin/profiles/${record._id}`}>{text}</Link>
        },
        { title: 'Name', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Gender', dataIndex: 'gender', key: 'gender', render: g => g === 'male' ? '👨' : '👩' },
        { title: 'City', dataIndex: 'city', key: 'city' },
        {
            title: 'Status',
            dataIndex: 'verificationStatus',
            key: 'verificationStatus',
            render: s => <Tag color={s === 'approved' ? 'green' : s === 'pending' ? 'orange' : 'red'}>{s}</Tag>
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: d => new Date(d).toLocaleDateString()
        }
    ];

    const loginColumns = [
        {
            title: 'Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: t => new Date(t).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
        },
        { title: 'IP Address', dataIndex: 'ip', key: 'ip', render: ip => <Text code>{ip || '-'}</Text> },
        { title: 'Device', dataIndex: 'userAgent', key: 'userAgent', ellipsis: true }
    ];

    const activityColumns = [
        { title: 'Action', dataIndex: 'action', key: 'action', render: a => <Tag>{a}</Tag> },
        {
            title: 'Time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: t => new Date(t).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
        },
        { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress', render: ip => <Text code>{ip || '-'}</Text> }
    ];

    const roleColors = { admin: 'red', moderator: 'purple', matchmaker: 'orange', individual: 'blue' };

    return (
        <div>
            <Button
                icon={<ArrowLeftOutlined />}
                style={{ marginBottom: 16 }}
                onClick={() => navigate('/admin/users')}
            >
                Back to Users
            </Button>

            <Row gutter={[16, 16]}>
                {/* User Info Card */}
                <Col xs={24} lg={8}>
                    <Card title={<><UserOutlined /> User Details</>} size="small">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
                            <Descriptions.Item label="Phone">{user.phone}</Descriptions.Item>
                            <Descriptions.Item label="Role">
                                <Tag color={roleColors[user.role]}>{user.role}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Verified">
                                {user.isVerified ? <Tag color="green">Yes</Tag> : <Tag color="orange">No</Tag>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                {user.isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Blocked</Tag>}
                            </Descriptions.Item>
                            <Descriptions.Item label="2FA">
                                {user.twoFactorEnabled ? <Tag color="blue">Enabled</Tag> : <Tag>Disabled</Tag>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Logins">{user.loginCount || 0}</Descriptions.Item>
                            <Descriptions.Item label="Last Login">
                                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Joined">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 16 }}>
                            <Space>
                                {user.isActive ? (
                                    <Popconfirm title="Block this user?" onConfirm={handleBlockUser}>
                                        <Button danger icon={<StopOutlined />} size="small">Block</Button>
                                    </Popconfirm>
                                ) : (
                                    <Popconfirm title="Unblock this user?" onConfirm={handleUnblockUser}>
                                        <Button type="primary" icon={<CheckCircleOutlined />} size="small">Unblock</Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        </div>
                    </Card>
                </Col>

                {/* Profiles Created */}
                <Col xs={24} lg={16}>
                    <Card title={<><IdcardOutlined /> Profiles Created ({profiles.length})</>} size="small">
                        <Table
                            columns={profileColumns}
                            dataSource={profiles.map((p, i) => ({ ...p, key: i }))}
                            pagination={false}
                            size="small"
                            scroll={{ x: 500 }}
                        />
                    </Card>
                </Col>

                {/* Login History */}
                <Col xs={24} lg={12}>
                    <Card title={<><LockOutlined /> Login History</>} size="small">
                        <Table
                            columns={loginColumns}
                            dataSource={(loginHistory || []).map((l, i) => ({ ...l, key: i }))}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                {/* Activity Log */}
                <Col xs={24} lg={12}>
                    <Card title={<><HistoryOutlined /> Recent Activity</>} size="small">
                        <Table
                            columns={activityColumns}
                            dataSource={activity.slice(0, 10).map((a, i) => ({ ...a, key: i }))}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminUserDetail;
