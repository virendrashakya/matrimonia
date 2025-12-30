import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Space, Divider, Dropdown } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, GlobalOutlined, MoonOutlined, SunOutlined, GoogleOutlined } from '@ant-design/icons';
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
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
            {/* Left Side - Branding */}
            <div style={{
                flex: 1.2,
                background: 'linear-gradient(135deg, #A0153E 0%, #7A0F2E 50%, #5C0B22 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }} className="auth-left-panel">

                {/* Decorative Elements */}
                <div className="rangoli-corner top-left" style={{ opacity: 0.2 }} />
                <div className="rangoli-corner bottom-right" style={{ opacity: 0.2 }} />

                {/* Glassmorphic Brand Container */}
                <div style={{
                    textAlign: 'center',
                    color: 'white',
                    zIndex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '60px 40px',
                    borderRadius: 24,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    maxWidth: 500,
                    margin: 40
                }}>
                    <img
                        src="/logo.png"
                        alt="Pehchan"
                        style={{
                            height: 100,
                            width: 100,
                            objectFit: 'contain',
                            marginBottom: 24,
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'
                        }}
                    />
                    <Title level={1} style={{
                        color: 'white',
                        marginBottom: 12,
                        fontSize: 'clamp(32px, 4vw, 48px)',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        fontFamily: "'Outfit', sans-serif"
                    }}>
                        {t.appName}
                    </Title>
                    <Text style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '20px',
                        display: 'block',
                        marginBottom: 8,
                        fontWeight: 300
                    }}>
                        {t.auth.joinCommunity}
                    </Text>
                    <Paragraph style={{
                        color: 'rgba(255,255,255,0.7)',
                        maxWidth: 320,
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        Connect with people who share your values, culture, and life goals.
                    </Paragraph>
                </div>
            </div>

            {/* Right Side - Form */}
            <div style={{
                flex: 1,
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
            }} className="auth-right-panel">

                {/* Scrollable Form Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    // Removed justifyContent: 'center' to prevent top clipping when content overflows
                    padding: 0
                }}>
                    <div className="auth-form-container" style={{
                        maxWidth: 420,
                        width: '100%',
                        padding: '40px 24px', // Add top/bottom padding for breathing room
                        margin: 'auto' // This safely centers the content vertically if it fits, or scrolls if it doesn't
                    }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div style={{ textAlign: 'left', marginBottom: 16 }}>
                                <Title level={2} style={{ marginBottom: 4, color: '#2C1810', fontSize: 26 }}>
                                    {t.auth.createAccount}
                                </Title>
                                <Text type="secondary" style={{ fontSize: 14 }}>Begin your journey today</Text>
                            </div>

                            <Form layout="vertical" onFinish={handleSubmit} size="middle" requiredMark={false}>
                                <Form.Item
                                    name="name"
                                    label={<span style={{ fontWeight: 500, fontSize: 13 }}>{t.auth.fullName}</span>}
                                    rules={[{ required: true, message: t.auth.enterName }]}
                                    style={{ marginBottom: 12 }}
                                >
                                    <Input
                                        prefix={<UserOutlined style={{ color: '#8B7355' }} />}
                                        placeholder={t.auth.enterName}
                                        style={{ borderRadius: 8, height: 42 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="phone"
                                    label={<span style={{ fontWeight: 500, fontSize: 13 }}>{t.auth.phone}</span>}
                                    rules={[{ required: true, message: t.auth.enterPhone }]}
                                    style={{ marginBottom: 12 }}
                                >
                                    <Input
                                        prefix={<PhoneOutlined style={{ color: '#8B7355' }} />}
                                        placeholder={t.auth.enterPhone}
                                        style={{ borderRadius: 8, height: 42 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    label={<span style={{ fontWeight: 500, fontSize: 13 }}>{t.auth.password}</span>}
                                    rules={[{ required: true }, { min: 6, message: 'Min 6 characters' }]}
                                    style={{ marginBottom: 12 }}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined style={{ color: '#8B7355' }} />}
                                        placeholder={t.auth.createPassword}
                                        style={{ borderRadius: 8, height: 42 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="confirmPassword"
                                    label={<span style={{ fontWeight: 500, fontSize: 13 }}>{t.auth.confirmPassword}</span>}
                                    rules={[{ required: true }]}
                                    style={{ marginBottom: 12 }}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined style={{ color: '#8B7355' }} />}
                                        placeholder={t.auth.confirmPassword}
                                        style={{ borderRadius: 8, height: 42 }}
                                    />
                                </Form.Item>

                                <Form.Item style={{ marginBottom: 12, marginTop: 12 }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        loading={loading}
                                        style={{
                                            height: 42,
                                            borderRadius: 8,
                                            fontSize: 15,
                                            fontWeight: 600,
                                            background: 'linear-gradient(135deg, #A0153E 0%, #7A0F2E 100%)',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(160, 21, 62, 0.2)'
                                        }}
                                    >
                                        {t.auth.register}
                                    </Button>
                                </Form.Item>
                            </Form>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ height: 1, background: '#f0f0f0', flex: 1 }} />
                                <Text type="secondary" style={{ fontSize: 12 }}>OR</Text>
                                <div style={{ height: 1, background: '#f0f0f0', flex: 1 }} />
                            </div>

                            <Button
                                block
                                size="large"
                                icon={<GoogleOutlined />}
                                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`}
                                style={{
                                    borderRadius: 8,
                                    height: 42,
                                    fontWeight: 500,
                                    border: '1px solid #d9d9d9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    fontSize: 14
                                }}
                            >
                                Sign up with Google
                            </Button>

                            <div style={{ textAlign: 'center', marginTop: 12 }}>
                                <Text type="secondary">{t.auth.haveAccount} </Text>
                                <Link to="/login" style={{ color: '#A0153E', fontWeight: 600 }}>
                                    {t.auth.loginHere}
                                </Link>
                            </div>
                        </Space>
                    </div>
                </div>

                {/* Footer - Accessibility & Language */}
                <div style={{
                    padding: '12px 24px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: 'white',
                    zIndex: 10,
                    borderTop: '1px solid #f5f5f5'
                }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Space size={4}>
                            <Button type="text" size="small" onClick={decreaseFontSize} style={{ border: '1px solid #f0f0f0', color: '#8B7355', width: 28, height: 28, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A-</Button>
                            <Button type="text" size="small" onClick={increaseFontSize} style={{ border: '1px solid #f0f0f0', color: '#8B7355', width: 28, height: 28, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A+</Button>
                        </Space>
                        <Button
                            type="text"
                            size="small"
                            onClick={toggleDarkMode}
                            icon={darkMode ? <SunOutlined style={{ fontSize: 12 }} /> : <MoonOutlined style={{ fontSize: 12 }} />}
                            style={{ background: darkMode ? '#FFD700' : 'transparent', border: darkMode ? 'none' : '1px solid #f0f0f0', color: '#8B7355', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        />
                        <Dropdown menu={languageMenu} placement="topRight">
                            <Button type="text" size="small" icon={<GlobalOutlined style={{ fontSize: 12 }} />} style={{
                                border: '1px solid #f0f0f0',
                                color: '#8B7355',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                height: 28,
                                padding: '0 8px',
                                fontSize: 12
                            }}>
                                {languages[language]?.nativeName}
                            </Button>
                        </Dropdown>
                    </div>
                </div>
            </div>

            {/* Simple Responsive Style */}
            <style>{`
                @media (max-width: 768px) {
                    .auth-left-panel {
                        display: none !important;
                    }
                    .auth-right-panel {
                        flex: 1 !important;
                        overflow: visible !important; /* Disable internal hidden overflow */
                        height: auto !important; /* Allow height to grow */
                    }
                    /* Target the inner scrollable div to disable internal scrolling */
                    .auth-right-panel > div:first-child {
                        overflow-y: visible !important;
                        flex: none !important;
                        height: auto !important;
                    }
                    .auth-form-container {
                        margin: 0 auto !important;
                        padding-top: 20px !important;
                    }
                    .auth-footer {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default Register;
