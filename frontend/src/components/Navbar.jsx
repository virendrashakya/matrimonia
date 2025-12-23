import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Typography, Tag, Avatar, Dropdown } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    SearchOutlined,
    PlusOutlined,
    ImportOutlined,
    LogoutOutlined,
    SettingOutlined,
    CrownOutlined,
    GlobalOutlined
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

    return (
        <Header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, #A0153E 0%, #7A0F2E 100%)',
            padding: '0 24px',
            boxShadow: '0 4px 20px rgba(160, 21, 62, 0.3)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Link to="/dashboard" className="app-logo" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    textDecoration: 'none'
                }}>
                    <img src="/logo.png" alt="Logo" style={{ height: 36, width: 36, objectFit: 'contain' }} />
                    <span className="logo-text" style={{
                        fontSize: 24,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #F4D160, #D4AF37, #F4D160)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-0.5px'
                    }}>
                        {t.appName}
                    </span>
                </Link>
                <Menu
                    mode="horizontal"
                    items={menuItems}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        minWidth: 400,
                        color: 'white'
                    }}
                    theme="dark"
                    selectedKeys={[]}
                />
            </div>

            <Space size="middle">
                {/* Language Switcher */}
                <Dropdown menu={languageMenu} placement="bottomRight">
                    <Button
                        icon={<GlobalOutlined />}
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: 'white',
                        }}
                    >
                        {languages[language]?.nativeName}
                    </Button>
                </Dropdown>

                <Space>
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
                        <Text style={{ color: 'white', fontWeight: 500, display: 'block', fontSize: 13 }}>
                            {user?.name}
                        </Text>
                        <Space size={4}>
                            {roleIcons[user?.role]}
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, textTransform: 'capitalize' }}>
                                {user?.role}
                            </Text>
                        </Space>
                    </div>
                </Space>
                <Button
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    size="small"
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white'
                    }}
                >
                    {t.nav.logout}
                </Button>
            </Space>
        </Header>
    );
}

export default Navbar;
