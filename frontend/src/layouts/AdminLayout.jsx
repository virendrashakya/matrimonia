import { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    IdcardOutlined,
    SettingOutlined,
    ToolOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate(user?.role === 'moderator' ? '/moderator-login' : '/admin-login');
    };

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: <Link to="/admin">Dashboard</Link>
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: <Link to="/admin/users">Users</Link>
        },
        {
            key: '/admin/profiles',
            icon: <IdcardOutlined />,
            label: <Link to="/admin/profiles">Profiles</Link>
        },
        ...(user?.role === 'admin' ? [{
            key: '/admin/config',
            icon: <ToolOutlined />,
            label: <Link to="/admin/config">Config</Link>
        }] : []),
        ...(user?.role === 'admin' ? [{
            key: '/admin/settings',
            icon: <SettingOutlined />,
            label: <Link to="/admin/settings">Settings</Link>
        }] : [])
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="dark"
                style={{
                    background: user?.role === 'admin'
                        ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
                        : 'linear-gradient(180deg, #2d1a4e 0%, #1e1640 100%)',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
                }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Title level={4} style={{ color: '#fff', margin: 0 }}>
                        {collapsed ? 'P' : (user?.role === 'admin' ? 'Admin' : 'Moderator')}
                    </Title>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ background: 'transparent', borderRight: 0 }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    padding: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Menu
                        theme="dark"
                        mode="inline"
                        style={{ background: 'transparent', borderRight: 0 }}
                        items={[
                            {
                                key: 'logout',
                                icon: <LogoutOutlined />,
                                label: 'Logout',
                                onClick: handleLogout
                            }
                        ]}
                    />
                </div>
            </Sider>
            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {collapsed ? (
                            <MenuUnfoldOutlined
                                onClick={() => setCollapsed(false)}
                                style={{ fontSize: 18, cursor: 'pointer' }}
                            />
                        ) : (
                            <MenuFoldOutlined
                                onClick={() => setCollapsed(true)}
                                style={{ fontSize: 18, cursor: 'pointer' }}
                            />
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <UserOutlined />
                        <span>{user?.name} ({user?.role})</span>
                    </div>
                </Header>
                <Content style={{
                    margin: 24,
                    padding: 24,
                    background: '#fff',
                    borderRadius: 8,
                    minHeight: 280
                }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminLayout;
