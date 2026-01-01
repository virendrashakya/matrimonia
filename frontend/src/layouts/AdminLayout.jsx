import { useState } from 'react';
import { Layout, Menu, Typography, Input, Avatar, Dropdown, Badge } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    IdcardOutlined,
    SettingOutlined,
    ToolOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    SearchOutlined,
    BellOutlined,
    TeamOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Metronic-inspired dark theme colors
const colors = {
    bgDark: '#0F172A',
    bgSidebar: '#1E293B',
    bgCard: '#1E293B',
    border: '#334155',
    textPrimary: '#F8FAFC',
    textMuted: '#94A3B8',
    primary: '#3B82F6',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6'
};

function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate(user?.role === 'moderator' ? '/moderator-login' : '/admin-login');
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: 'My Profile',
            icon: <UserOutlined />,
            onClick: () => navigate('/admin/settings')
        },
        { type: 'divider' },
        {
            key: 'logout',
            label: 'Sign Out',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout
        }
    ];

    const menuItems = [
        {
            type: 'group',
            label: !collapsed && <span style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1 }}>DASHBOARD</span>,
            children: [
                {
                    key: '/admin',
                    icon: <BarChartOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/admin" style={{ color: 'inherit' }}>Analytics</Link>
                }
            ]
        },
        {
            type: 'group',
            label: !collapsed && <span style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1 }}>MANAGEMENT</span>,
            children: [
                {
                    key: '/admin/users',
                    icon: <TeamOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/admin/users" style={{ color: 'inherit' }}>Users</Link>
                },
                {
                    key: '/admin/profiles',
                    icon: <IdcardOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/admin/profiles" style={{ color: 'inherit' }}>Profiles</Link>
                }
            ]
        },
        ...(user?.role === 'admin' ? [{
            type: 'group',
            label: !collapsed && <span style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1 }}>SYSTEM</span>,
            children: [
                {
                    key: '/admin/config',
                    icon: <ToolOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/admin/config" style={{ color: 'inherit' }}>Configuration</Link>
                },
                {
                    key: '/admin/settings',
                    icon: <SettingOutlined style={{ fontSize: 18 }} />,
                    label: <Link to="/admin/settings" style={{ color: 'inherit' }}>Settings</Link>
                }
            ]
        }] : [])
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: colors.bgDark }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                collapsedWidth={80}
                style={{
                    background: colors.bgSidebar,
                    borderRight: `1px solid ${colors.border}`,
                    position: 'fixed',
                    height: '100vh',
                    left: 0,
                    top: 0,
                    zIndex: 100
                }}
            >
                {/* Logo */}
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? 0 : '0 24px',
                    borderBottom: `1px solid ${colors.border}`
                }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.purple} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>P</span>
                    </div>
                    {!collapsed && (
                        <span style={{
                            marginLeft: 12,
                            color: colors.textPrimary,
                            fontWeight: 600,
                            fontSize: 18,
                            letterSpacing: -0.5
                        }}>
                            Pehchaan
                        </span>
                    )}
                </div>

                {/* Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '16px 12px',
                        marginTop: 8
                    }}
                    theme="dark"
                />

                {/* Collapse Toggle */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    padding: 16,
                    borderTop: `1px solid ${colors.border}`
                }}>
                    <div
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.05)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {collapsed ? (
                            <MenuUnfoldOutlined style={{ color: colors.textMuted, fontSize: 18 }} />
                        ) : (
                            <>
                                <MenuFoldOutlined style={{ color: colors.textMuted, fontSize: 18 }} />
                                <span style={{ marginLeft: 12, color: colors.textMuted }}>Collapse</span>
                            </>
                        )}
                    </div>
                </div>
            </Sider>

            <Layout style={{
                marginLeft: collapsed ? 80 : 260,
                background: colors.bgDark,
                transition: 'margin-left 0.2s'
            }}>
                {/* Header */}
                <Header style={{
                    padding: '0 24px',
                    background: colors.bgSidebar,
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 99,
                    height: 64
                }}>
                    {/* Search */}
                    <Input
                        placeholder="Search..."
                        prefix={<SearchOutlined style={{ color: colors.textMuted }} />}
                        style={{
                            width: 280,
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: 8,
                            color: colors.textPrimary
                        }}
                    />

                    {/* Right side */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Badge count={3} size="small">
                            <BellOutlined style={{ fontSize: 20, color: colors.textMuted, cursor: 'pointer' }} />
                        </Badge>

                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: 'rgba(255,255,255,0.05)'
                            }}>
                                <Avatar
                                    style={{
                                        background: user?.role === 'admin'
                                            ? colors.primary
                                            : colors.purple
                                    }}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </Avatar>
                                <div style={{ lineHeight: 1.3 }}>
                                    <Text style={{ color: colors.textPrimary, display: 'block', fontSize: 13 }}>
                                        {user?.name || 'Admin'}
                                    </Text>
                                    <Text style={{ color: colors.textMuted, fontSize: 11, textTransform: 'capitalize' }}>
                                        {user?.role}
                                    </Text>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* Content */}
                <Content style={{
                    margin: 24,
                    padding: 24,
                    background: colors.bgDark,
                    minHeight: 'calc(100vh - 112px)'
                }}>
                    <Outlet />
                </Content>
            </Layout>

            {/* Custom styles for dark menu */}
            <style>{`
                .ant-menu-dark .ant-menu-item {
                    color: ${colors.textMuted} !important;
                    border-radius: 8px !important;
                    margin: 4px 0 !important;
                }
                .ant-menu-dark .ant-menu-item:hover {
                    color: ${colors.textPrimary} !important;
                    background: rgba(255,255,255,0.08) !important;
                }
                .ant-menu-dark .ant-menu-item-selected {
                    background: rgba(59, 130, 246, 0.2) !important;
                    color: ${colors.primary} !important;
                }
                .ant-menu-item-group-title {
                    padding: 8px 16px !important;
                }
                .ant-input::placeholder {
                    color: ${colors.textMuted} !important;
                }
            `}</style>
        </Layout>
    );
}

export default AdminLayout;
