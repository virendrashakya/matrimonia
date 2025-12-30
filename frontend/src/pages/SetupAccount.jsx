import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Layout, Card, Form, Input, Button, Typography, message, Spin } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Content } = Layout;
const { Title, Text } = Typography;

function SetupAccount() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { updateUser } = useAuth(); // Assuming we might need to update context, or just let login handle it locally

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            message.error('Invalid setup link');
            navigate('/login');
        }
    }, [token, navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/setup-account', {
                token,
                password: values.password
            });

            // Auto login logic: store token and user
            localStorage.setItem('token', response.data.data.token);
            // We need to update auth context state, but since we are outside the provider's login function scope specifically,
            // we can reload or rely on the fact that we redirect to dashboard/profile which checks auth.
            // A clean redirect reload is safest to initialize auth context.

            message.success('Account setup successful!');
            setSuccess(true);

            // Redirect after a moment
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);

        } catch (error) {
            message.error(error.response?.data?.error || 'Setup failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE4E6 100%)'
            }}>
                <Card style={{ textAlign: 'center', padding: 40, borderRadius: 16 }}>
                    <CheckCircleOutlined style={{ fontSize: 64, color: '#059669', marginBottom: 24 }} />
                    <Title level={2} style={{ color: '#064E3B' }}>Welcome Aboard!</Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>Your account is ready. Redirecting you...</Text>
                    <div style={{ marginTop: 24 }}>
                        <Spin size="large" />
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: 'white' }}>
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #A0153E 0%, #DE3163 100%)',
                padding: 24
            }}>
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <img src="/logo.png" alt="Pehchan" style={{ height: 60, marginBottom: 16, filter: 'brightness(0) invert(1)' }} />
                    <Title level={2} style={{ color: 'white', margin: 0 }}>Setup Your Account</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Check your details and set a secure password</Text>
                </div>

                <Card
                    style={{
                        width: '100%',
                        maxWidth: 440,
                        borderRadius: 16,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                >
                    <Form
                        name="setup_account"
                        layout="vertical"
                        onFinish={onFinish}
                        size="large"
                    >
                        <Form.Item
                            name="password"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Create a strong password" />
                        </Form.Item>

                        <Form.Item
                            name="confirm"
                            label="Confirm Password"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" />
                        </Form.Item>

                        <Form.Item style={{ marginTop: 24 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                style={{
                                    height: 48,
                                    backgroundColor: '#A0153E',
                                    borderColor: '#A0153E',
                                    fontSize: 16,
                                    fontWeight: 600
                                }}
                            >
                                Activate Account
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
                <div style={{ marginTop: 24 }}>
                    <Link to="/login" style={{ color: 'rgba(255,255,255,0.8)' }}>Back to Login</Link>
                </div>
            </div>
        </Layout>
    );
}

export default SetupAccount;
