import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Space, Divider, Dropdown } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, GlobalOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const { Title, Text, Paragraph } = Typography;

function Register() {
    const { register } = useAuth();
    const { t, language, languages, changeLanguage } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        if (values.password !== values.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await register(values.name, values.phone, values.password);
            toast.success(t.dashboard.namaste + '!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const languageMenu = {
        items: Object.entries(languages).map(([code, lang]) => ({
            key: code,
            label: <span>{lang.nativeName} {language === code && '✓'}</span>,
            onClick: () => changeLanguage(code),
        })),
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFBF5 50%, #FFF5EB 100%)',
        }}>
            {/* Left side - Decorative */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #A0153E 0%, #7A0F2E 50%, #5C0B22 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 48,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Language Selector */}
                <div style={{ position: 'absolute', top: 24, right: 24 }}>
                    <Dropdown menu={languageMenu} placement="bottomRight">
                        <Button icon={<GlobalOutlined />} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
                            {languages[language]?.nativeName}
                        </Button>
                    </Dropdown>
                </div>

                <div style={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.1)',
                }} />

                <div style={{ textAlign: 'center', color: 'white', zIndex: 1 }}>
                    <img src="/logo.png" alt="Matrimonia" style={{ height: 120, width: 120, objectFit: 'contain', marginBottom: 24 }} />
                    <Title level={1} style={{ color: 'white', marginBottom: 16, fontSize: 48 }}>
                        {t.appName}
                    </Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, maxWidth: 400 }}>
                        {t.tagline}
                    </Paragraph>
                </div>
            </div>

            {/* Right side - Register form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 48,
            }}>
                <Card
                    style={{
                        width: 420,
                        maxWidth: '100%',
                        borderRadius: 16,
                        boxShadow: '0 8px 40px rgba(44, 24, 16, 0.1)',
                        border: '1px solid #F3E8D8',
                    }}
                    bodyStyle={{ padding: 40 }}
                >
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={2} style={{ marginBottom: 8, color: '#2C1810' }}>
                                {t.auth.register}
                            </Title>
                            <Text type="secondary">{t.auth.joinCommunity}</Text>
                        </div>

                        <Form layout="vertical" onFinish={handleSubmit}>
                            <Form.Item
                                name="name"
                                label={<span style={{ fontWeight: 500 }}>{t.auth.fullName}</span>}
                                rules={[{ required: true, message: t.auth.enterName }]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#8B7355' }} />}
                                    placeholder={t.auth.enterName}
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label={<span style={{ fontWeight: 500 }}>{t.auth.phone}</span>}
                                rules={[{ required: true, message: t.auth.enterPhone }]}
                            >
                                <Input
                                    prefix={<PhoneOutlined style={{ color: '#8B7355' }} />}
                                    placeholder={t.auth.enterPhone}
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span style={{ fontWeight: 500 }}>{t.auth.password}</span>}
                                rules={[{ required: true }, { min: 6 }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#8B7355' }} />}
                                    placeholder={t.auth.createPassword}
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label={<span style={{ fontWeight: 500 }}>{t.auth.confirmPassword}</span>}
                                rules={[{ required: true }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#8B7355' }} />}
                                    placeholder={t.auth.confirmPassword}
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 16 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={loading}
                                    style={{ height: 42, borderRadius: 8, fontSize: 15, fontWeight: 600 }}
                                >
                                    {t.auth.register}
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider style={{ margin: '8px 0' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>{t.auth.haveAccount}</Text>
                        </Divider>

                        <Link to="/login">
                            <Button
                                block
                                style={{ borderRadius: 8, borderColor: '#A0153E', color: '#A0153E', fontWeight: 500 }}
                            >
                                {t.auth.loginHere}
                            </Button>
                        </Link>
                    </Space>
                </Card>
            </div>
        </div>
    );
}

export default Register;
