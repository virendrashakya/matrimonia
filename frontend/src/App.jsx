import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profiles from './pages/Profiles';
import ProfileDetail from './pages/ProfileDetail';
import AddProfile from './pages/AddProfile';
import Search from './pages/Search';
import ImportWhatsApp from './pages/ImportWhatsApp';

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
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
        <>
            {isAuthenticated && <Navbar />}
            <main className="container">
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={
                        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                    } />
                    <Route path="/register" element={
                        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
                    } />

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
                    <Route path="/search" element={
                        <ProtectedRoute><Search /></ProtectedRoute>
                    } />
                    <Route path="/import" element={
                        <ProtectedRoute><ImportWhatsApp /></ProtectedRoute>
                    } />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </main>
        </>
    );
}

export default App;
