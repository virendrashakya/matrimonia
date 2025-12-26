import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Typography, Avatar, Dropdown, Drawer } from 'antd';
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
    CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const { Header } = Layout;
const { Text } = Typography;

function Navbar() {
    const { user, logout, isElder } = useAuth();
    const { t, language, changeLanguage, languages } = useLanguage();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

                    {/* User info */}
                    <Link to="/profile" style={{ textDecoration: 'none' }}>
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
                                    {user?.name?.split(' ')[0]}
                                </Text>
                            </div>
                        </Space>
                    </Link>

                    <Button
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        size="small"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: 'none',
                            color: 'white'
                        }}
                    />
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
