import { useState } from 'react';
import ProfileCard from '../components/ProfileCard';
import api from '../services/api';

function Search() {
    const [filters, setFilters] = useState({
        gender: '',
        ageMin: '',
        ageMax: '',
        caste: '',
        city: '',
        education: '',
        maritalStatus: '',
        recognitionLevel: ''
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Build query string from non-empty filters
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await api.get(`/search/profiles?${params.toString()}`);
            setResults(response.data.data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({
            gender: '',
            ageMin: '',
            ageMax: '',
            caste: '',
            city: '',
            education: '',
            maritalStatus: '',
            recognitionLevel: ''
        });
        setResults(null);
    };

    return (
        <div className="page">
            <h1 style={{ marginBottom: '32px' }}>Search Profiles</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
                {/* Filters Sidebar */}
                <aside>
                    <form onSubmit={handleSearch} className="card">
                        <h3 style={{ marginBottom: '24px' }}>Filters</h3>

                        <div className="form-group">
                            <label>Gender</label>
                            <select name="gender" value={filters.gender} onChange={handleChange}>
                                <option value="">Any</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Age Range</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    name="ageMin"
                                    placeholder="Min"
                                    min="18"
                                    max="100"
                                    value={filters.ageMin}
                                    onChange={handleChange}
                                />
                                <input
                                    type="number"
                                    name="ageMax"
                                    placeholder="Max"
                                    min="18"
                                    max="100"
                                    value={filters.ageMax}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Caste</label>
                            <input
                                type="text"
                                name="caste"
                                placeholder="Enter caste"
                                value={filters.caste}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                placeholder="Enter city"
                                value={filters.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Education</label>
                            <input
                                type="text"
                                name="education"
                                placeholder="e.g., B.Tech, MBA"
                                value={filters.education}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Marital Status</label>
                            <select name="maritalStatus" value={filters.maritalStatus} onChange={handleChange}>
                                <option value="">Any</option>
                                <option value="never_married">Never Married</option>
                                <option value="divorced">Divorced</option>
                                <option value="widowed">Widowed</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Recognition Level</label>
                            <select name="recognitionLevel" value={filters.recognitionLevel} onChange={handleChange}>
                                <option value="">Any</option>
                                <option value="new">New</option>
                                <option value="low">Low</option>
                                <option value="moderate">Moderate</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                                {loading ? 'Searching...' : '🔍 Search'}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={clearFilters}>
                                Clear
                            </button>
                        </div>
                    </form>
                </aside>

                {/* Results */}
                <main>
                    {loading ? (
                        <div className="flex-center" style={{ padding: '64px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : results ? (
                        <>
                            <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
                                Found {results.pagination.total} profiles
                            </p>

                            {results.profiles.length > 0 ? (
                                <div className="profile-grid">
                                    {results.profiles.map(profile => (
                                        <ProfileCard key={profile._id} profile={profile} />
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🔍</div>
                                    <h3>No profiles found</h3>
                                    <p>Try adjusting your filters</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <h3>Start searching</h3>
                            <p>Use the filters to find matching profiles</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Search;
