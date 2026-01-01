import { useState } from 'react';
import { Form, Input, Button, Typography, Card, message, Alert } from 'antd';
import { LockOutlined, PhoneOutlined, SafetyOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { Title, Text } = Typography;

function ModeratorLogin() {
    const [loading, setLoading] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [credentials, setCredentials] = useState(null);
    const navigate = useNavigate();
    const { setAuthData } = useAuth();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = show2FA
                ? { ...credentials, totpToken: values.totpToken }
                : { phone: values.phone, password: values.password };

            const response = await api.post('/auth/moderator-login', payload);

            if (response.data.success) {
                setAuthData(response.data.data.user, response.data.data.token);
                message.success('Welcome back, Moderator!');
                navigate('/admin');
            }
        } catch (error) {
            if (error.response?.data?.require2FA) {
                setShow2FA(true);
                setCredentials({ phone: values.phone, password: values.password });
                message.info('Please enter your 2FA code');
            } else {
                message.error(error.response?.data?.error || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #2d1a4e 0%, #1e1640 50%, #16103a 100%)'
        }}>
            <Card
                style={{
                    width: 400,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    borderRadius: 12,
                    border: 'none'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <EyeOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
                    <Title level={3} style={{ margin: 0 }}>Moderator Portal</Title>
                    <Text type="secondary">Content Moderation Console</Text>
                </div>

                <Alert
                    message="Moderator Access"
                    description="This portal is for content moderators only."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Form layout="vertical" onFinish={handleSubmit}>
                    {!show2FA ? (
                        <>
                            <Form.Item
                                name="phone"
                                rules={[
                                    { required: true, message: 'Phone number is required' },
                                    { len: 10, message: 'Enter 10 digit number' }
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined />}
                                    placeholder="Phone Number"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Password is required' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Password"
                                    size="large"
                                />
                            </Form.Item>
                        </>
                    ) : (
                        <Form.Item
                            name="totpToken"
                            rules={[{ required: true, message: 'Enter 6-digit code' }]}
                        >
                            <Input
                                prefix={<SafetyOutlined />}
                                placeholder="2FA Code"
                                size="large"
                                maxLength={6}
                            />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            style={{
                                background: 'linear-gradient(135deg, #722ed1, #531dab)',
                                border: 'none',
                                height: 48
                            }}
                        >
                            {show2FA ? 'Verify' : 'Login'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default ModeratorLogin;
