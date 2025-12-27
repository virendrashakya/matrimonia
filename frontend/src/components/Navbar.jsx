import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Typography, Avatar, Dropdown, Drawer, Badge, List, Empty } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    SearchOutlined,
    PlusOutlined,
    ImportOutlined,
    LogoutOutlined,
    SettingOutlined,
    CrownOutlined,
    GlobalOutlined,
    MenuOutlined,
    CloseOutlined,
    HeartOutlined,
    BellOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const { Header } = Layout;
const { Text } = Typography;

function Navbar() {
    const { user, logout, isElder } = useAuth();
    const { t, language, changeLanguage, languages, isHindi } = useLanguage();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications?limit=5');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (e) { /* ignore */ }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (e) { /* ignore */ }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { key: 'dashboard', icon: <HomeOutlined />, label: <Link to="/dashboard">{t.nav.home}</Link> },
        { key: 'profiles', icon: <UserOutlined />, label: <Link to="/profiles">{t.nav.profiles}</Link> },
        { key: 'search', icon: <SearchOutlined />, label: <Link to="/search">{t.nav.search}</Link> },
        { key: 'new', icon: <PlusOutlined />, label: <Link to="/profiles/new">{t.nav.addProfile}</Link> },
        ...(isElder ? [{ key: 'import', icon: <ImportOutlined />, label: <Link to="/import">{t.nav.import}</Link> }] : []),
        ...(isAdmin ? [{ key: 'admin', icon: <SettingOutlined />, label: <Link to="/admin">{t.nav.admin}</Link> }] : []),
    ];

    const roleIcons = {
        admin: <CrownOutlined style={{ color: '#D4AF37' }} />,
        moderator: <SettingOutlined style={{ color: '#8B5CF6' }} />,
        matchmaker: <UserOutlined style={{ color: '#F59E0B' }} />,
        elder: <UserOutlined style={{ color: '#059669' }} />,
    };

    const languageMenu = {
        items: Object.entries(languages).map(([code, lang]) => ({
            key: code,
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{lang.nativeName}</span>
                    {language === code && <span style={{ color: '#A0153E' }}>✓</span>}
                </span>
            ),
            onClick: () => changeLanguage(code),
        })),
    };

    // Mobile menu items for drawer
    const mobileMenuItems = [
        { key: 'dashboard', icon: <HomeOutlined />, label: t.nav.home, path: '/dashboard' },
        { key: 'profiles', icon: <UserOutlined />, label: t.nav.profiles, path: '/profiles' },
        { key: 'search', icon: <SearchOutlined />, label: t.nav.search, path: '/search' },
        { key: 'new', icon: <PlusOutlined />, label: t.nav.addProfile, path: '/profiles/new' },
        { key: 'my-profile', icon: <UserOutlined />, label: isHindi ? 'मेरी प्रोफ़ाइल' : 'My Profile', path: '/profile' },
        { key: 'interests', icon: <HeartOutlined />, label: isHindi ? 'मेरी रुचियाँ' : 'My Interests', path: '/interests' },
        ...(isElder ? [{ key: 'import', icon: <ImportOutlined />, label: t.nav.import, path: '/import' }] : []),
        ...(isAdmin ? [{ key: 'admin', icon: <SettingOutlined />, label: t.nav.admin, path: '/admin' }] : []),
    ];

    return (
        <>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(90deg, #A0153E 0%, #7A0F2E 100%)',
                padding: '0 16px',
                boxShadow: '0 4px 20px rgba(160, 21, 62, 0.3)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                height: 56,
            }}>
                {/* Logo */}
                <Link to="/dashboard" className="app-logo" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    textDecoration: 'none'
                }}>
                    <img src="/logo.png" alt="Logo" style={{ height: 32, width: 32, objectFit: 'contain' }} />
                    <span className="logo-text" style={{
                        fontSize: 20,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #F4D160, #D4AF37, #F4D160)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        {t.appName}
                    </span>
                </Link>

                {/* Desktop Menu - hidden on mobile */}
                <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Menu
                        mode="horizontal"
                        items={menuItems}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            flex: 1,
                        }}
                        theme="dark"
                        selectedKeys={[]}
                    />

                    {/* Language Switcher */}
                    <Dropdown menu={languageMenu} placement="bottomRight">
                        <Button
                            icon={<GlobalOutlined />}
                            size="small"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: 'none',
                                color: 'white',
                            }}
                        >
                            {languages[language]?.nativeName}
                        </Button>
                    </Dropdown>

                    {/* Notification Bell */}
                    <Dropdown
                        trigger={['click']}
                        placement="bottomRight"
                        dropdownRender={() => (
                            <div style={{
                                background: 'white',
                                borderRadius: 12,
                                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                width: 320,
                                maxHeight: 400,
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #f0f0f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Text strong>{isHindi ? 'सूचनाएं' : 'Notifications'}</Text>
                                    {unreadCount > 0 && (
                                        <Button
                                            type="link"
                                            size="small"
                                            onClick={async () => {
                                                await api.put('/notifications/read-all');
                                                fetchNotifications();
                                            }}
                                        >
                                            {isHindi ? 'सभी पढ़े' : 'Mark all read'}
                                        </Button>
                                    )}
                                </div>
                                {notifications.length > 0 ? (
                                    <List
                                        size="small"
                                        dataSource={notifications}
                                        renderItem={(item) => (
                                            <List.Item
                                                style={{
                                                    padding: '12px 16px',
                                                    background: item.isRead ? 'white' : '#FFF8F0',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    if (!item.isRead) markAsRead(item._id);
                                                    if (item.data?.actionUrl) navigate(item.data.actionUrl);
                                                }}
                                            >
                                                <List.Item.Meta
                                                    title={<Text style={{ fontSize: 13 }}>{isHindi ? item.titleHi || item.title : item.title}</Text>}
                                                    description={
                                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </Text>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={isHindi ? 'कोई सूचना नहीं' : 'No notifications'}
                                        style={{ padding: 24 }}
                                    />
                                )}
                                <Link to="/interests" style={{ display: 'block', textAlign: 'center', padding: '8px 16px', borderTop: '1px solid #f0f0f0' }}>
                                    {isHindi ? 'सभी देखें' : 'View All'}
                                </Link>
                            </div>
                        )}
                    >
                        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                            <Button
                                icon={<BellOutlined />}
                                size="small"
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    border: 'none',
                                    color: 'white',
                                }}
                            />
                        </Badge>
                    </Dropdown>

                    {/* User Avatar Dropdown */}
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'profile',
                                    icon: <UserOutlined />,
                                    label: isHindi ? 'मेरी प्रोफ़ाइल' : 'My Profile',
                                    onClick: () => navigate('/profile'),
                                },
                                {
                                    key: 'interests',
                                    icon: <HeartOutlined />,
                                    label: isHindi ? 'मेरी रुचियाँ' : 'My Interests',
                                    onClick: () => navigate('/interests'),
                                },
                                { type: 'divider' },
                                {
                                    key: 'logout',
                                    icon: <LogoutOutlined />,
                                    label: t.nav.logout,
                                    danger: true,
                                    onClick: handleLogout,
                                },
                            ],
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Space size={8} style={{ cursor: 'pointer' }}>
                            <Avatar
                                style={{
                                    backgroundColor: '#D4AF37',
                                    color: '#2C1810',
                                    fontWeight: 600
                                }}
                                size="small"
                            >
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <div style={{ lineHeight: 1.2 }}>
                                <Text style={{ color: 'white', fontWeight: 500, display: 'block', fontSize: 12 }}>
                                    {user?.name?.split(' ')[0]} ▾
                                </Text>
                            </div>
                        </Space>
                    </Dropdown>
                </div>

                {/* Mobile Menu Button */}
                <Button
                    className="mobile-menu-btn"
                    icon={<MenuOutlined />}
                    onClick={() => setMobileMenuOpen(true)}
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        color: 'white',
                        display: 'none', // Will show on mobile via CSS
                    }}
                />
            </Header>

            {/* Mobile Drawer Menu */}
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar style={{ backgroundColor: '#D4AF37', color: '#2C1810' }} size="small">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <div>
                            <Text strong>{user?.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12, textTransform: 'capitalize' }}>
                                {roleIcons[user?.role]} {user?.role}
                            </Text>
                        </div>
                    </div>
                }
                placement="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                width={280}
                closeIcon={<CloseOutlined />}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {mobileMenuItems.map(item => (
                        <Link
                            key={item.key}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: 8,
                                color: '#2C1810',
                                textDecoration: 'none',
                                background: '#FFF8F0',
                            }}
                        >
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            <span style={{ fontSize: 15 }}>{item.label}</span>
                        </Link>
                    ))}

                    <div style={{ margin: '16px 0', borderTop: '1px solid #F3E8D8' }} />

                    {/* Language in drawer */}
                    <div style={{ padding: '0 16px', marginBottom: 16 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Language</Text>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            {Object.entries(languages).map(([code, lang]) => (
                                <Button
                                    key={code}
                                    type={language === code ? 'primary' : 'default'}
                                    size="small"
                                    onClick={() => { changeLanguage(code); setMobileMenuOpen(false); }}
                                >
                                    {lang.nativeName}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Button
                        icon={<LogoutOutlined />}
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        danger
                        block
                        style={{ marginTop: 'auto' }}
                    >
                        {t.nav.logout}
                    </Button>
                </div>
            </Drawer>

            {/* CSS for responsive hiding */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-menu { display: none !important; }
                    .mobile-menu-btn { display: flex !important; }
                }
                @media (min-width: 769px) {
                    .mobile-menu-btn { display: none !important; }
                }
            `}</style>
        </>
    );
}

export default Navbar;
