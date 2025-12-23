import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout, isElder } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="nav">
            <div className="container nav-content">
                <Link to="/dashboard" className="nav-brand">
                    🪔 Matrimonia
                </Link>

                <div className="nav-links">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/profiles" className="nav-link">Profiles</Link>
                    <Link to="/search" className="nav-link">Search</Link>
                    <Link to="/profiles/new" className="nav-link">Add Profile</Link>
                    {isElder && <Link to="/import" className="nav-link">📥 Import</Link>}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {user?.name}
                            {user?.isVerified && ' ✓'}
                            <span style={{ marginLeft: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                ({user?.role})
                            </span>
                        </span>
                        <button onClick={handleLogout} className="btn btn-outline" style={{ minHeight: '36px', padding: '8px 16px' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
