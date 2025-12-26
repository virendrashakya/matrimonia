import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Avatar, Button, Spin, Tag, Divider, Form, Input, message, Statistic, Modal } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    CalendarOutlined,
    SafetyCertificateOutlined,
    EditOutlined,
    LockOutlined,
    TeamOutlined,
    HeartOutlined,
    GlobalOutlined,
    ShopOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;

// Role badge colors and labels
const roleBadges = {
    admin: { color: '#A0153E', label: 'Administrator', labelHi: 'प्रशासक', icon: '👑' },
    moderator: { color: '#7C3AED', label: 'Moderator', labelHi: 'मॉडरेटर', icon: '🛡️' },
    matchmaker: { color: '#D4AF37', label: 'Matchmaker', labelHi: 'मैचमेकर', icon: '💍' },
    elder: { color: '#059669', label: 'Elder', labelHi: 'बड़े-बुज़ुर्ग', icon: '🙏' },
    helper: { color: '#0891B2', label: 'Helper', labelHi: 'सहायक', icon: '🤝' },
    contributor: { color: '#6B7280', label: 'Contributor', labelHi: 'योगदानकर्ता', icon: '👤' }
};

function UserProfile() {
    const { user, setUser } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const isHindi = language === 'hi';

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/user/me');
            setUserData(response.data.user);
            setStats(response.data.stats);
            form.setFieldsValue({
                name: response.data.user.name,
                email: response.data.user.email
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            message.error(isHindi ? 'प्रोफ़ाइल लोड करने में त्रुटि' : 'Error loading profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values) => {
        setSaving(true);
        try {
            const response = await api.put('/user/me', values);
            setUserData(response.data.user);
            setUser({ ...user, name: values.name, email: values.email });
            setEditing(false);
            message.success(isHindi ? 'प्रोफ़ाइल अपडेट हो गई' : 'Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error(isHindi ? 'अपडेट करने में त्रुटि' : 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (values) => {
        setChangingPassword(true);
        try {
            await api.put('/user/change-password', values);
            message.success(isHindi ? 'पासवर्ड बदल गया' : 'Password changed successfully');
            setPasswordModalVisible(false);
            passwordForm.resetFields();
        } catch (error) {
            console.error('Error changing password:', error);
            message.error(error.response?.data?.error || (isHindi ? 'पासवर्ड बदलने में त्रुटि' : 'Error changing password'));
        } finally {
            setChangingPassword(false);
        }
    };

    const handleLanguageChange = async (lang) => {
        try {
            await api.put('/user/me', { preferredLanguage: lang });
            setLanguage(lang);
            message.success(lang === 'hi' ? 'भाषा हिंदी में बदली गई' : 'Language changed to English');
        } catch (error) {
            console.error('Error changing language:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    const roleBadge = roleBadges[userData?.role] || roleBadges.contributor;

    return (
        <div style={{ padding: '32px 0', maxWidth: 900, margin: '0 auto' }}>
            {/* Profile Header Card */}
            <Card
                style={{
                    marginBottom: 24,
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
            >
                {/* Header Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #A0153E 0%, #7A0F2E 100%)',
                    margin: '-24px -24px 24px -24px',
                    padding: '40px 24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative circle */}
                    <div style={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(212, 175, 55, 0.1)',
                    }} />

                    <Row align="middle" gutter={24}>
                        <Col>
                            <Avatar
                                size={100}
                                icon={<UserOutlined />}
                                style={{
                                    backgroundColor: '#D4AF37',
                                    border: '4px solid rgba(255,255,255,0.3)',
                                    fontSize: 48
                                }}
                            />
                        </Col>
                        <Col flex="auto">
                            <Title level={2} style={{ color: 'white', margin: 0 }}>
                                {userData?.name}
                            </Title>
                            <div style={{ marginTop: 8 }}>
                                <Tag
                                    icon={<span style={{ marginRight: 4 }}>{roleBadge.icon}</span>}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: 14,
                                        padding: '4px 12px',
                                        borderRadius: 20
                                    }}
                                >
                                    {isHindi ? roleBadge.labelHi : roleBadge.label}
                                </Tag>
                                {userData?.isVerified && (
                                    <Tag
                                        icon={<CheckCircleOutlined />}
                                        style={{
                                            background: 'rgba(5, 150, 105, 0.3)',
                                            border: 'none',
                                            color: '#A7F3D0',
                                            marginLeft: 8,
                                            fontSize: 14,
                                            padding: '4px 12px',
                                            borderRadius: 20
                                        }}
                                    >
                                        {isHindi ? 'सत्यापित' : 'Verified'}
                                    </Tag>
                                )}
                            </div>
                        </Col>
                        <Col>
                            <Button
                                type="default"
                                icon={<EditOutlined />}
                                onClick={() => setEditing(!editing)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: 'white'
                                }}
                            >
                                {isHindi ? 'संपादित करें' : 'Edit'}
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* Account Info / Edit Form */}
                {editing ? (
                    <Form form={form} layout="vertical" onFinish={handleSave}>
                        <Row gutter={24}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="name"
                                    label={isHindi ? 'नाम' : 'Name'}
                                    rules={[{ required: true, message: isHindi ? 'नाम आवश्यक है' : 'Name is required' }]}
                                >
                                    <Input prefix={<UserOutlined />} size="large" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="email" label={isHindi ? 'ईमेल' : 'Email'}>
                                    <Input prefix={<MailOutlined />} size="large" type="email" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Button type="primary" htmlType="submit" loading={saving}>
                                {isHindi ? 'सहेजें' : 'Save'}
                            </Button>
                            <Button onClick={() => setEditing(false)}>
                                {isHindi ? 'रद्द करें' : 'Cancel'}
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <PhoneOutlined style={{ fontSize: 20, color: '#A0153E' }} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {isHindi ? 'फ़ोन नंबर' : 'Phone Number'}
                                    </Text>
                                    <div><Text strong>{userData?.phone}</Text></div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <MailOutlined style={{ fontSize: 20, color: '#A0153E' }} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {isHindi ? 'ईमेल' : 'Email'}
                                    </Text>
                                    <div><Text strong>{userData?.email || (isHindi ? 'जोड़ा नहीं गया' : 'Not added')}</Text></div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <CalendarOutlined style={{ fontSize: 20, color: '#A0153E' }} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {isHindi ? 'शामिल होने की तारीख' : 'Joined'}
                                    </Text>
                                    <div>
                                        <Text strong>
                                            {new Date(userData?.createdAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <SafetyCertificateOutlined style={{ fontSize: 20, color: userData?.isVerified ? '#059669' : '#D97706' }} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {isHindi ? 'सत्यापन स्थिति' : 'Verification Status'}
                                    </Text>
                                    <div>
                                        <Tag color={userData?.isVerified ? 'success' : 'warning'}>
                                            {userData?.isVerified
                                                ? (isHindi ? 'सत्यापित' : 'Verified')
                                                : (isHindi ? 'लंबित' : 'Pending')}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                )}
            </Card>

            {/* Activity Stats */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #D4AF37' }}>
                        <Statistic
                            title={<Text style={{ color: '#8B7355' }}>{isHindi ? 'प्रोफ़ाइल बनाई' : 'Profiles Created'}</Text>}
                            value={stats?.profilesCreated || 0}
                            prefix={<TeamOutlined style={{ color: '#D4AF37' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card style={{ borderRadius: 12, borderLeft: '4px solid #A0153E' }}>
                        <Statistic
                            title={<Text style={{ color: '#8B7355' }}>{isHindi ? 'पहचान दी' : 'Recognitions Given'}</Text>}
                            value={stats?.recognitionsGiven || 0}
                            prefix={<HeartOutlined style={{ color: '#A0153E' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Agency Info (for matchmakers) */}
            {userData?.role === 'matchmaker' && userData?.agency?.name && (
                <Card
                    title={
                        <span>
                            <ShopOutlined style={{ marginRight: 8, color: '#D4AF37' }} />
                            {isHindi ? 'एजेंसी की जानकारी' : 'Agency Information'}
                        </span>
                    }
                    style={{ marginBottom: 24, borderRadius: 12 }}
                >
                    <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12}>
                            <Text type="secondary">{isHindi ? 'एजेंसी का नाम' : 'Agency Name'}</Text>
                            <div><Text strong style={{ fontSize: 16 }}>{userData.agency.name}</Text></div>
                        </Col>
                        {userData.agency.city && (
                            <Col xs={24} sm={12}>
                                <Text type="secondary">{isHindi ? 'स्थान' : 'Location'}</Text>
                                <div><Text strong>{userData.agency.city}, {userData.agency.state}</Text></div>
                            </Col>
                        )}
                        {userData.agency.establishedYear && (
                            <Col xs={24} sm={12}>
                                <Text type="secondary">{isHindi ? 'स्थापना वर्ष' : 'Established'}</Text>
                                <div><Text strong>{userData.agency.establishedYear}</Text></div>
                            </Col>
                        )}
                        {userData.agency.description && (
                            <Col xs={24}>
                                <Text type="secondary">{isHindi ? 'विवरण' : 'Description'}</Text>
                                <Paragraph style={{ margin: '4px 0 0 0' }}>{userData.agency.description}</Paragraph>
                            </Col>
                        )}
                    </Row>
                </Card>
            )}

            {/* Settings */}
            <Card
                title={isHindi ? '⚙️ सेटिंग्स' : '⚙️ Settings'}
                style={{ borderRadius: 12 }}
            >
                <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12}>
                        <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <GlobalOutlined style={{ fontSize: 24, color: '#A0153E' }} />
                                    <div>
                                        <Text strong>{isHindi ? 'भाषा' : 'Language'}</Text>
                                        <div><Text type="secondary">{isHindi ? 'ऐप की भाषा बदलें' : 'Change app language'}</Text></div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button
                                        type={language === 'en' ? 'primary' : 'default'}
                                        size="small"
                                        onClick={() => handleLanguageChange('en')}
                                    >
                                        EN
                                    </Button>
                                    <Button
                                        type={language === 'hi' ? 'primary' : 'default'}
                                        size="small"
                                        onClick={() => handleLanguageChange('hi')}
                                    >
                                        हि
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <LockOutlined style={{ fontSize: 24, color: '#A0153E' }} />
                                    <div>
                                        <Text strong>{isHindi ? 'पासवर्ड' : 'Password'}</Text>
                                        <div><Text type="secondary">{isHindi ? 'पासवर्ड बदलें' : 'Change your password'}</Text></div>
                                    </div>
                                </div>
                                <Button onClick={() => setPasswordModalVisible(true)}>
                                    {isHindi ? 'बदलें' : 'Change'}
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Password Change Modal */}
            <Modal
                title={isHindi ? '🔐 पासवर्ड बदलें' : '🔐 Change Password'}
                open={passwordModalVisible}
                onCancel={() => {
                    setPasswordModalVisible(false);
                    passwordForm.resetFields();
                }}
                footer={null}
            >
                <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                    <Form.Item
                        name="currentPassword"
                        label={isHindi ? 'वर्तमान पासवर्ड' : 'Current Password'}
                        rules={[{ required: true, message: isHindi ? 'वर्तमान पासवर्ड आवश्यक है' : 'Current password is required' }]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label={isHindi ? 'नया पासवर्ड' : 'New Password'}
                        rules={[
                            { required: true, message: isHindi ? 'नया पासवर्ड आवश्यक है' : 'New password is required' },
                            { min: 6, message: isHindi ? 'कम से कम 6 अक्षर' : 'At least 6 characters' }
                        ]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label={isHindi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: isHindi ? 'पुष्टि आवश्यक है' : 'Confirmation required' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(isHindi ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <Button onClick={() => setPasswordModalVisible(false)}>
                            {isHindi ? 'रद्द करें' : 'Cancel'}
                        </Button>
                        <Button type="primary" htmlType="submit" loading={changingPassword}>
                            {isHindi ? 'पासवर्ड बदलें' : 'Change Password'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default UserProfile;
