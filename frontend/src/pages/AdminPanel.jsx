import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Select, Input, Tabs, Spin, message, Popconfirm, Badge, Statistic } from 'antd';
import { UserOutlined, SafetyOutlined, CheckCircleOutlined, StopOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

function AdminPanel() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data.data.users);
        } catch (error) {
            message.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`/auth/users/${userId}/role`, { role: newRole });
            message.success('Role updated successfully');
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to update role');
        }
    };

    const handleVerify = async (userId) => {
        try {
            await api.patch(`/auth/users/${userId}/verify`);
            message.success('User verified successfully');
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to verify user');
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await api.patch(`/auth/users/${userId}/status`, { isActive: !currentStatus });
            message.success(currentStatus ? 'User deactivated' : 'User activated');
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to update status');
        }
    };

    const roleColors = {
        admin: 'red',
        moderator: 'purple',
        matchmaker: 'orange',
        elder: 'green',
        helper: 'blue',
        contributor: 'default'
    };

    const moderators = users.filter(u => u.role === 'moderator');
    const pendingVerification = users.filter(u => !u.isVerified && u.isActive);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchText.toLowerCase()) ||
        u.phone.includes(searchText)
    );

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <Space>
                    <UserOutlined />
                    <span>{name}</span>
                    {record._id === user?._id && <Tag color="blue">You</Tag>}
                </Space>
            )
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role, record) => (
                <Select
                    value={role}
                    onChange={(newRole) => handleRoleChange(record._id, newRole)}
                    style={{ width: 130 }}
                    disabled={record._id === user?._id}
                >
                    <Option value="admin">Admin</Option>
                    <Option value="moderator">Moderator</Option>
                    <Option value="matchmaker">Matchmaker</Option>
                    <Option value="elder">Elder</Option>
                    <Option value="helper">Helper</Option>
                    <Option value="contributor">Contributor</Option>
                </Select>
            )
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Space>
                    {record.isVerified ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>Verified</Tag>
                    ) : (
                        <Tag color="orange">Unverified</Tag>
                    )}
                    {!record.isActive && <Tag color="red">Inactive</Tag>}
                </Space>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {!record.isVerified && (
                        <Button type="primary" size="small" onClick={() => handleVerify(record._id)}>
                            Verify
                        </Button>
                    )}
                    {record._id !== user?._id && (
                        <Popconfirm
                            title={record.isActive ? 'Deactivate this user?' : 'Activate this user?'}
                            onConfirm={() => handleToggleActive(record._id, record.isActive)}
                        >
                            <Button danger={record.isActive} size="small">
                                {record.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 0' }}>
            <Title level={2}>Admin Panel</Title>

            {/* Quick Stats */}
            <Space size="large" style={{ marginBottom: 32 }}>
                <Card size="small">
                    <Statistic title="Total Users" value={users.length} prefix={<UserOutlined />} />
                </Card>
                <Card size="small">
                    <Statistic title="Moderators" value={moderators.length} prefix={<SafetyOutlined />} />
                </Card>
                <Card size="small">
                    <Badge count={pendingVerification.length} showZero>
                        <Statistic title="Pending Verification" value={pendingVerification.length} />
                    </Badge>
                </Card>
            </Space>

            <Tabs
                defaultActiveKey="all"
                items={[
                    {
                        key: 'all',
                        label: `All Users (${users.length})`,
                        children: (
                            <>
                                <Input
                                    placeholder="Search by name or phone"
                                    prefix={<SearchOutlined />}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{ width: 300, marginBottom: 16 }}
                                    allowClear
                                />
                                <Table
                                    columns={columns}
                                    dataSource={filteredUsers.map(u => ({ ...u, key: u._id }))}
                                    pagination={{ pageSize: 10 }}
                                />
                            </>
                        )
                    },
                    {
                        key: 'moderators',
                        label: `Moderators (${moderators.length})`,
                        children: (
                            <Table
                                columns={columns.filter(c => c.key !== 'role')}
                                dataSource={moderators.map(u => ({ ...u, key: u._id }))}
                                pagination={false}
                            />
                        )
                    },
                    {
                        key: 'pending',
                        label: (
                            <Badge count={pendingVerification.length} offset={[10, 0]}>
                                Pending Verification
                            </Badge>
                        ),
                        children: (
                            <Table
                                columns={columns}
                                dataSource={pendingVerification.map(u => ({ ...u, key: u._id }))}
                                pagination={false}
                            />
                        )
                    }
                ]}
            />

            {/* Add Moderator Quick Action */}
            <Card title="Quick Actions" style={{ marginTop: 24 }}>
                <Text type="secondary">
                    To add a moderator, find the user in the table above and change their role to "Moderator".
                    Moderators can:
                </Text>
                <ul style={{ marginTop: 16, color: 'var(--text-secondary)' }}>
                    <li>Verify new users</li>
                    <li>Edit and moderate profiles</li>
                    <li>Flag suspicious profiles</li>
                    <li>Add recognitions with higher weight</li>
                </ul>
            </Card>
        </div>
    );
}

export default AdminPanel;
