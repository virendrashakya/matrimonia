import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Space, Divider, Dropdown } from 'antd';
import { LockOutlined, PhoneOutlined, GlobalOutlined, MoonOutlined, SunOutlined, GoogleOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';

const { Title, Text, Paragraph } = Typography;

function Login() {
    const { login } = useAuth();
    const { t, language, languages, changeLanguage } = useLanguage();
    const { increaseFontSize, decreaseFontSize, darkMode, toggleDarkMode } = useAccessibility();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await login(values.phone, values.password);
            toast.success(t.dashboard.namaste + '!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
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
            background: 'linear-gradient(135deg, #A0153E 0%, #7A0F2E 50%, #5C0B22 100%)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Accessibility & Language - Top Right */}
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
                <Space size={4}>
                    <Button type="text" size="small" onClick={decreaseFontSize} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A-</Button>
                    <Button type="text" size="small" onClick={increaseFontSize} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A+</Button>
                </Space>
                <Button
                    type="text"
                    size="small"
                    onClick={toggleDarkMode}
                    icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
                    style={{ background: darkMode ? '#FFD700' : 'rgba(255,255,255,0.15)', border: darkMode ? 'none' : '1px solid rgba(255,255,255,0.3)', color: darkMode ? '#000' : 'white', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                />
                <Dropdown menu={languageMenu} placement="bottomRight">
                    <Button type="text" icon={<GlobalOutlined />} style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    }}>
                        {languages[language]?.nativeName}
                    </Button>
                </Dropdown>
            </div>

            {/* Hero Section */}
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'white',
            }}>
                <img
                    src="/logo.png"
                    alt="Pehchan"
                    style={{
                        height: 80,
                        width: 80,
                        objectFit: 'contain',
                        marginBottom: 16
                    }}
                />
                <Title level={1} style={{
                    color: 'white',
                    marginBottom: 8,
                    fontSize: 'clamp(28px, 6vw, 48px)'
                }}>
                    {t.appName}
                </Title>
                <Paragraph style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 'clamp(14px, 3vw, 18px)',
                    maxWidth: 400,
                    margin: '0 auto',
                }}>
                    {t.tagline}
                </Paragraph>
            </div>

            {/* Login Card */}
            <div style={{
                flex: 1,
                background: 'white',
                borderRadius: '24px 24px 0 0',
                padding: '32px 20px 48px',
                marginTop: 'auto',
            }}>
                <div style={{ maxWidth: 400, margin: '0 auto' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={2} style={{ marginBottom: 8, color: '#2C1810' }}>
                                {t.auth.welcomeBack}
                            </Title>
                            <Text type="secondary">{t.auth.signInToContinue}</Text>
                        </div>

                        <Form layout="vertical" onFinish={handleSubmit}>
                            <Form.Item
                                name="phone"
                                label={<span style={{ fontWeight: 500 }}>{t.auth.phone}</span>}
                                rules={[{ required: true, message: t.auth.enterPhone }]}
                            >
                                <Input
                                    prefix={<PhoneOutlined style={{ color: '#8B7355' }} />}
                                    placeholder={t.auth.enterPhone}
                                    size="large"
                                    style={{ borderRadius: 12 }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span style={{ fontWeight: 500 }}>{t.auth.password}</span>}
                                rules={[{ required: true, message: t.auth.enterPassword }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#8B7355' }} />}
                                    placeholder={t.auth.enterPassword}
                                    size="large"
                                    style={{ borderRadius: 12 }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 16, marginTop: 24 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={loading}
                                    size="large"
                                    style={{
                                        height: 48,
                                        borderRadius: 12,
                                        fontSize: 16,
                                        fontWeight: 600
                                    }}
                                >
                                    {t.auth.login}
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider plain>
                            <Text type="secondary" style={{ fontSize: 13 }}>OR</Text>
                        </Divider>

                        <Button
                            block
                            size="large"
                            icon={<GoogleOutlined />}
                            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}
                            style={{
                                borderRadius: 12,
                                height: 48,
                                fontWeight: 500
                            }}
                        >
                            Sign in with Google
                        </Button>

                        <Divider style={{ margin: '8px 0' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>{t.auth.noAccount}</Text>
                        </Divider>

                        <Link to="/register">
                            <Button
                                block
                                size="large"
                                style={{
                                    borderRadius: 12,
                                    borderColor: '#A0153E',
                                    color: '#A0153E',
                                    fontWeight: 500,
                                    height: 48,
                                }}
                            >
                                {t.auth.register}
                            </Button>
                        </Link>
                    </Space>
                </div>
            </div>
        </div>
    );
}

export default Login;
