import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Select, Input, Tabs, Spin, message, Popconfirm, Badge, Statistic } from 'antd';
import { UserOutlined, SafetyOutlined, CheckCircleOutlined, StopOutlined, SearchOutlined, LockOutlined, UserAddOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
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
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [resettingPassword, setResettingPassword] = useState(false);
    const [resetForm] = Form.useForm();
    const [userToReset, setUserToReset] = useState(null);

    // Invite User Logic
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [inviteResult, setInviteResult] = useState(null); // { setupUrl, setupToken }
    const [inviteForm] = Form.useForm();

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

    const initiatePasswordReset = (user) => {
        setUserToReset(user);
        setPasswordModalOpen(true);
    };

    const handlePasswordReset = async (values) => {
        setResettingPassword(true);
        try {
            await api.put(`/auth/users/${userToReset._id}/password`, { newPassword: values.newPassword });
            message.success(`Password reset for ${userToReset.name}`);
            setPasswordModalOpen(false);
            resetForm.resetFields();
            setUserToReset(null);
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to reset password');
        } finally {
            setResettingPassword(false);
        }
    };

    const handleReset2FA = async (user) => {
        try {
            await api.put(`/auth/users/${user._id}/2fa/reset`);
            message.success(`2FA reset for ${user.name}`);
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to reset 2FA');
        }
    };

    const handleDeleteUser = async (user) => {
        try {
            await api.delete(`/auth/users/${user._id}`);
            message.success(`User ${user.name} and their profiles deleted`);
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleInvite = async (values) => {
        setInviting(true);
        try {
            const response = await api.post('/auth/invite', values);
            setInviteResult(response.data.data);
            setInviteModalOpen(false);
            inviteForm.resetFields();
            message.success('User created and upgrade link generated!');
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to invite user');
        } finally {
            setInviting(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success('Link copied to clipboard!');
    };

    const roleColors = {
        admin: 'red',
        moderator: 'purple',
        matchmaker: 'orange',
        individual: 'default'
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
                    <Option value="individual">Individual</Option>
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
                    <Button
                        size="small"
                        icon={<LockOutlined />}
                        onClick={() => initiatePasswordReset(record)}
                        title="Reset Password"
                    />
                    {record.isTwoFactorEnabled && (
                        <Popconfirm
                            title="Reset 2FA for this user?"
                            onConfirm={() => handleReset2FA(record)}
                        >
                            <Button
                                size="small"
                                icon={<SafetyOutlined />}
                                danger
                                title="Reset 2FA"
                            />
                        </Popconfirm>
                    )}
                    {record._id !== user?._id && (
                        <Popconfirm
                            title="Delete this user?"
                            description="This will permanently delete the user and ALL their profiles. This action cannot be undone."
                            onConfirm={() => handleDeleteUser(record)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                size="small"
                                icon={<DeleteOutlined />}
                                danger
                                title="Delete User"
                                style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#b91c1c' }}
                            />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Admin Panel</Title>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => setInviteModalOpen(true)}
                    style={{ backgroundColor: '#059669' }}
                >
                    Create User
                </Button>
            </div>

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
                    <li>Reset user passwords</li>
                </ul>
            </Card>

            {/* Password Reset Modal */}
            <Modal
                title={`Reset Password for ${userToReset?.name}`}
                open={passwordModalOpen}
                onCancel={() => {
                    setPasswordModalOpen(false);
                    resetForm.resetFields();
                    setUserToReset(null);
                }}
                footer={null}
            >
                <Form form={resetForm} layout="vertical" onFinish={handlePasswordReset}>
                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            { required: true, message: 'New password is required' },
                            { min: 6, message: 'At least 6 characters' }
                        ]}
                    >
                        <Input.Password placeholder="Enter new password" />
                    </Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button
                            onClick={() => {
                                setPasswordModalOpen(false);
                                resetForm.resetFields();
                                setUserToReset(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={resettingPassword} danger>
                            Reset Password
                        </Button>
                    </div>
                </Form>
            </Modal>


            {/* Invite User Modal */}
            <Modal
                title="Create New User"
                open={inviteModalOpen}
                onCancel={() => setInviteModalOpen(false)}
                footer={null}
            >
                <Form form={inviteForm} layout="vertical" onFinish={handleInvite}>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input placeholder="Full Name" />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone" rules={[{ required: true, len: 10, message: '10 digits' }]}>
                        <Input placeholder="Mobile Number" />
                    </Form.Item>
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                        <Select placeholder="Select Role">
                            <Option value="individual">Individual</Option>
                            <Option value="matchmaker">Matchmaker</Option>
                        </Select>
                    </Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button onClick={() => setInviteModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={inviting}>Create & Get Link</Button>
                    </div>
                </Form>
            </Modal>

            {/* Invite Result Modal */}
            <Modal
                title="User Created Successfully"
                open={!!inviteResult}
                onCancel={() => setInviteResult(null)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setInviteResult(null)}>
                        Done
                    </Button>
                ]}
            >
                <div style={{ textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: 48, color: '#059669', marginBottom: 16 }} />
                    <Text display="block">Share this setup link with the user:</Text>
                    <div style={{
                        marginTop: 16,
                        marginBottom: 16,
                        padding: 12,
                        background: '#f3f4f6',
                        borderRadius: 8,
                        wordBreak: 'break-all',
                        fontSize: 12,
                        position: 'relative'
                    }}>
                        {inviteResult?.setupUrl}
                    </div>
                    <Button
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(inviteResult?.setupUrl)}
                    >
                        Copy Link
                    </Button>
                </div>
            </Modal>
        </div >
    );
}

export default AdminPanel;
