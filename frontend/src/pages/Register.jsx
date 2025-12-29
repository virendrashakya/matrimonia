import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Space, Divider, Dropdown } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, GlobalOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';

const { Title, Text, Paragraph } = Typography;

function Register() {
    const { register } = useAuth();
    const { t, language, languages, changeLanguage } = useLanguage();
    const { increaseFontSize, decreaseFontSize, darkMode, toggleDarkMode } = useAccessibility();
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
            background: 'linear-gradient(135deg, #A0153E 0%, #7A0F2E 50%, #5C0B22 100%)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Accessibility & Language - Top Right */}
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
                <Space size={4}>
                    <Button size="small" onClick={decreaseFontSize} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 28, height: 28, padding: 0 }}>A-</Button>
                    <Button size="small" onClick={increaseFontSize} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 28, height: 28, padding: 0 }}>A+</Button>
                </Space>
                <Button
                    size="small"
                    onClick={toggleDarkMode}
                    icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
                    style={{ background: darkMode ? '#FFD700' : 'rgba(255,255,255,0.2)', border: 'none', color: darkMode ? '#000' : 'white', width: 32, height: 32 }}
                />
                <Dropdown menu={languageMenu} placement="bottomRight">
                    <Button icon={<GlobalOutlined />} style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white'
                    }}>
                        {languages[language]?.nativeName}
                    </Button>
                </Dropdown>
            </div>

            {/* Hero Section */}
            <div style={{
                padding: '32px 20px',
                textAlign: 'center',
                color: 'white',
            }}>
                <img
                    src="/logo.png"
                    alt="Pehchan"
                    style={{
                        height: 60,
                        width: 60,
                        objectFit: 'contain',
                        marginBottom: 12
                    }}
                />
                <Title level={2} style={{
                    color: 'white',
                    marginBottom: 4,
                    fontSize: 'clamp(24px, 5vw, 36px)'
                }}>
                    {t.appName}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {t.auth.joinCommunity}
                </Text>
            </div>

            {/* Register Card */}
            <div style={{
                flex: 1,
                background: 'white',
                borderRadius: '24px 24px 0 0',
                padding: '24px 20px 48px',
                marginTop: 'auto',
                overflowY: 'auto',
            }}>
                <div style={{ maxWidth: 400, margin: '0 auto' }}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={3} style={{ marginBottom: 4, color: '#2C1810' }}>
                                {t.auth.createAccount}
                            </Title>
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
                                    size="large"
                                    style={{ borderRadius: 12 }}
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
                                    size="large"
                                    style={{ borderRadius: 12 }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span style={{ fontWeight: 500 }}>{t.auth.password}</span>}
                                rules={[{ required: true }, { min: 6, message: 'Min 6 characters' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#8B7355' }} />}
                                    placeholder={t.auth.createPassword}
                                    size="large"
                                    style={{ borderRadius: 12 }}
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
                                    size="large"
                                    style={{ borderRadius: 12 }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 16, marginTop: 20 }}>
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
                                    {t.auth.register}
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider style={{ margin: '4px 0' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>{t.auth.haveAccount}</Text>
                        </Divider>

                        <Link to="/login">
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
                                {t.auth.loginHere}
                            </Button>
                        </Link>
                    </Space>
                </div>
            </div>
        </div>
    );
}

export default Register;
