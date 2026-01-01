import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.data.user);
        } catch (error) {
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (phone, password, totpToken) => {
        const response = await api.post('/auth/login', { phone, password, totpToken });
        const { user, token: newToken } = response.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(user);
        return user;
    };

    const register = async (name, phone, password) => {
        const response = await api.post('/auth/register', { name, phone, password });
        const { user, token: newToken } = response.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // Direct auth data setter (for admin/moderator login pages that handle API themselves)
    const setAuthData = (userData, newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            logout,
            setAuthData,
            fetchUser,
            updateUser,
            isAuthenticated: !!user,
            isVerified: user?.isVerified || false,
            isAdmin: user?.role === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export default AuthContext;
