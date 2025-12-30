import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profiles from './pages/Profiles';
import ProfileDetail from './pages/ProfileDetail';
import AddProfile from './pages/AddProfile';
import EditProfile from './pages/EditProfile';
import Search from './pages/Search';
import ImportWhatsApp from './pages/ImportWhatsApp';
import AdminPanel from './pages/AdminPanel';
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

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

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

    return children;
}

function App() {
    const { isAuthenticated } = useAuth();

    return (
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
                    <Route path="/profiles/:id/edit" element={
                        <ProtectedRoute><EditProfile /></ProtectedRoute>
                    } />
                    <Route path="/search" element={
                        <ProtectedRoute><Search /></ProtectedRoute>
                    } />
                    <Route path="/import" element={
                        <ProtectedRoute><ImportWhatsApp /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute><AdminPanel /></ProtectedRoute>
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

                    {/* Error Routes */}
                    <Route path="/500" element={<ServerError />} />

                    {/* Fallback */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Content>
        </Layout>
    );
}

export default App;

