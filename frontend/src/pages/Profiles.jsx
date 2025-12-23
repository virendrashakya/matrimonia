import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import api from '../services/api';

function Profiles() {
    const [profiles, setProfiles] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfiles(1);
    }, []);

    const fetchProfiles = async (page) => {
        setLoading(true);
        try {
            const response = await api.get(`/profiles?page=${page}&limit=12`);
            setProfiles(response.data.data.profiles);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Error fetching profiles:', error);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>All Profiles</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>{pagination.total} active profiles</p>
                </div>
                <Link to="/profiles/new" className="btn btn-primary">
                    ➕ Add New Profile
                </Link>
            </div>

            {profiles.length > 0 ? (
                <>
                    <div className="profile-grid">
                        {profiles.map(profile => (
                            <ProfileCard key={profile._id} profile={profile} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => fetchProfiles(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                ← Previous
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                className="btn btn-outline"
                                onClick={() => fetchProfiles(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <h3>No profiles yet</h3>
                    <p>Be the first to add a matrimonial profile!</p>
                    <Link to="/profiles/new" className="btn btn-primary mt-2">Add Profile</Link>
                </div>
            )}
        </div>
    );
}

export default Profiles;
