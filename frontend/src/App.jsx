import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

// Custom Logic
import Navbar from './components/Navbar';
import CallModal from './components/CallModal';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import ModeratorLogin from './pages/ModeratorLogin';
import Dashboard from './pages/Dashboard';
import Profiles from './pages/Profiles';
import ProfileDetail from './pages/ProfileDetail';
import Messages from './pages/Messages';
import AddProfile from './pages/AddProfile';
import EditProfile from './pages/EditProfile';
import Search from './pages/Search';
import ImportWhatsApp from './pages/ImportWhatsApp';
import AdminPanel from './pages/AdminPanel';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminConfig from './pages/AdminConfig';
import UserProfile from './pages/UserProfile';
import InterestsPage from './pages/InterestsPage';
import MatchmakerDashboard from './pages/MatchmakerDashboard';
import ProfileComparison from './pages/ProfileComparison';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import PublicProfile from './pages/PublicProfile';
import SetupAccount from './pages/SetupAccount';

const { Content } = Layout;

// Protected Route wrapper (for individual/matchmaker users only)
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect admin/moderator to admin portal - they shouldn't access user routes
    if (['admin', 'moderator'].includes(user?.role)) {
        return <Navigate to="/admin" replace />;
    }

    return children;
}

// Admin/Moderator Route wrapper - redirects to AdminLayout
function AdminRoleRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin-login" replace />;
    }

    if (!['admin', 'moderator'].includes(user?.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function App() {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAdminLogin = location.pathname === '/admin-login';
    const isModeratorLogin = location.pathname === '/moderator-login';

    // Admin/Moderator login pages - render without any layout
    if (isAdminLogin || isModeratorLogin) {
        return (
            <ChatProvider>
                <Routes>
                    <Route path="/admin-login" element={
                        isAuthenticated && user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLogin />
                    } />
                    <Route path="/moderator-login" element={
                        isAuthenticated && user?.role === 'moderator' ? <Navigate to="/admin" replace /> : <ModeratorLogin />
                    } />
                </Routes>
            </ChatProvider>
        );
    }

    // Admin portal - render with AdminLayout
    if (isAdminRoute && isAuthenticated && ['admin', 'moderator'].includes(user?.role)) {
        return (
            <ChatProvider>
                <CallModal />
                <Routes>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminPanel />} />
                        <Route path="users/:id" element={<AdminUserDetail />} />
                        <Route path="profiles" element={<Profiles />} />
                        <Route path="profiles/:id" element={<ProfileDetail />} />
                        <Route path="profiles/:id/edit" element={<EditProfile />} />
                        <Route path="config" element={<AdminConfig />} />
                        <Route path="settings" element={<UserProfile />} />
                    </Route>
                </Routes>
            </ChatProvider>
        );
    }

    // Regular user layout
    return (
        <ChatProvider>
            <CallModal />
            <Layout style={{ minHeight: '100vh' }}>
                {isAuthenticated && <Navbar />}
                <Content style={{ padding: isAuthenticated ? '0 24px' : 0, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/setup" element={
                            isAuthenticated ? <Navigate to="/dashboard" replace /> : <SetupAccount />
                        } />
                        <Route path="/" element={
                            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
                        } />
                        <Route path="/login" element={
                            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                        } />
                        <Route path="/register" element={
                            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
                        } />

                        <Route path="/auth/callback" element={
                            isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthCallback />
                        } />
                        <Route path="/public/:customId" element={<PublicProfile />} />

                        {/* Protected routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute><Dashboard /></ProtectedRoute>
                        } />
                        <Route path="/profiles" element={
                            <ProtectedRoute><Profiles /></ProtectedRoute>
                        } />
                        <Route path="/profiles/new" element={
                            <ProtectedRoute><AddProfile /></ProtectedRoute>
                        } />
                        <Route path="/profiles/:id" element={
                            <ProtectedRoute><ProfileDetail /></ProtectedRoute>
                        } />
                        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                        <Route path="/profiles/:id/edit" element={
                            <ProtectedRoute><EditProfile /></ProtectedRoute>
                        } />
                        <Route path="/search" element={
                            <ProtectedRoute><Search /></ProtectedRoute>
                        } />
                        <Route path="/import" element={
                            <ProtectedRoute><ImportWhatsApp /></ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute><UserProfile /></ProtectedRoute>
                        } />
                        <Route path="/interests" element={
                            <ProtectedRoute><InterestsPage /></ProtectedRoute>
                        } />
                        <Route path="/my-profiles" element={
                            <ProtectedRoute><MatchmakerDashboard /></ProtectedRoute>
                        } />
                        <Route path="/shortlist" element={
                            <ProtectedRoute><ProfileComparison /></ProtectedRoute>
                        } />

                        {/* Redirect /admin for non-admin users */}
                        <Route path="/admin/*" element={
                            <Navigate to="/admin-login" replace />
                        } />

                        {/* Error Routes */}
                        <Route path="/500" element={<ServerError />} />

                        {/* Fallback */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Content>
            </Layout>
        </ChatProvider>
    );
}

export default App;
