import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin, Typography } from 'antd';
import toast from 'react-hot-toast';

const { Text } = Typography;

function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchUser } = useAuth(); // Assuming fetchUser is exposed or I need to expose it

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // We need to update the user in context. 
            // Since fetchUser might not be exposed directly in useAuth return value based on previous read,
            // we might need to rely on the fact that AuthProvider checks token on mount/update.
            // or better, reload usage of window.location to strictly force context update if fetchUser isn't available.

            // However, checking AuthContext.jsx from previous steps:
            // It DOES NOT expose fetchUser. It exposes login, register, logout, updateUser.
            // But it runs fetchUser on mount if token exists.

            // So simply navigating might not trigger a re-fetch if the context doesn't re-mount?
            // Actually, navigate doesn't unmount AuthProvider.
            // I should probably manually trigger a page reload or expose fetchUser.
            // For now, I will use window.location.href to force a full reload which ensures AuthContext picks up the new token.
            // Or I can modify AuthContext to expose fetchUser. exposing fetchUser is cleaner.

            // Let's force reload for now to avoid changing Context API contract mid-flight if not necessary, 
            // but modifying Context is better practice.
            // checking AuthContext again...
            // It has `const fetchUser = async () => { ... }` defined inside.
            // I should expose it.

            fetchUser().then(() => {
                navigate('/dashboard');
                toast.success('Successfully logged in with Google');
            }).catch(() => {
                toast.error('Failed to load user profile');
                navigate('/login');
            });
        } else {
            toast.error('Login failed');
            navigate('/login');
        }
    }, [searchParams, navigate, fetchUser]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 16
        }}>
            <Spin size="large" />
            <Text>Authenticating...</Text>
        </div>
    );
}

export default AuthCallback;
