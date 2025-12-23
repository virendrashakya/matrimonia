import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import api from '../services/api';

function Dashboard() {
    const { user, isVerified, isElder } = useAuth();
    const [recentProfiles, setRecentProfiles] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/profiles?limit=6');
            setRecentProfiles(response.data.data.profiles);
            setStats({
                total: response.data.data.pagination.total
            });
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page flex-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page">
            {/* Welcome Section */}
            <section style={{ marginBottom: '48px' }}>
                <h1 style={{ marginBottom: '8px' }}>Welcome, {user?.name}!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
                    {isVerified
                        ? '✓ You are verified and can add recognitions'
                        : '⚠️ Ask an elder to verify your account to add recognitions'
                    }
                </p>
            </section>

            {/* Quick Actions */}
            <section style={{ marginBottom: '48px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                }}>
                    <Link to="/profiles/new" className="card" style={{
                        textDecoration: 'none',
                        textAlign: 'center',
                        padding: '32px',
                        transition: 'transform 0.2s'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>➕</div>
                        <h3>Add New Profile</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Create a matrimonial profile</p>
                    </Link>

                    <Link to="/search" className="card" style={{
                        textDecoration: 'none',
                        textAlign: 'center',
                        padding: '32px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔍</div>
                        <h3>Search Profiles</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Find matches with filters</p>
                    </Link>

                    <Link to="/profiles" className="card" style={{
                        textDecoration: 'none',
                        textAlign: 'center',
                        padding: '32px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📋</div>
                        <h3>All Profiles</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>{stats?.total || 0} active profiles</p>
                    </Link>
                </div>
            </section>

            {/* Recent Profiles */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2>Recent Profiles</h2>
                    <Link to="/profiles" className="btn btn-outline">View All</Link>
                </div>

                {recentProfiles.length > 0 ? (
                    <div className="profile-grid">
                        {recentProfiles.map(profile => (
                            <ProfileCard key={profile._id} profile={profile} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No profiles yet</h3>
                        <p>Be the first to add a matrimonial profile!</p>
                        <Link to="/profiles/new" className="btn btn-primary mt-2">Add Profile</Link>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
