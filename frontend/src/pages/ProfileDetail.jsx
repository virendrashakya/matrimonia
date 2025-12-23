import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecognitionSection from '../components/RecognitionSection';
import api from '../services/api';

function ProfileDetail() {
    const { id } = useParams();
    const { isVerified } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const response = await api.get(`/profiles/${id}`);
            setProfile(response.data.data.profile);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const riskColors = {
        low: 'var(--risk-low)',
        medium: 'var(--risk-medium)',
        high: 'var(--risk-high)'
    };

    const riskLabels = {
        low: '✓ Looks good',
        medium: '⚠ Needs verification',
        high: '✗ Exercise caution'
    };

    if (loading) {
        return (
            <div className="page flex-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="page">
                <div className="empty-state">
                    <h3>Profile not found</h3>
                    <Link to="/profiles" className="btn btn-primary mt-2">Back to Profiles</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <Link to="/profiles" style={{ display: 'inline-block', marginBottom: '24px', color: 'var(--text-muted)' }}>
                ← Back to Profiles
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
                {/* Photo Column */}
                <div>
                    {profile.photos?.[0]?.url ? (
                        <img
                            src={profile.photos.find(p => p.isPrimary)?.url || profile.photos[0].url}
                            alt={profile.fullName}
                            style={{
                                width: '100%',
                                borderRadius: '12px',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '300px',
                            background: 'var(--border)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '64px'
                        }}>
                            👤
                        </div>
                    )}

                    {/* Fraud Risk */}
                    <div className="card" style={{ marginTop: '16px', textAlign: 'center' }}>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: riskColors[profile.fraudRisk?.level || 'low']
                        }}>
                            {riskLabels[profile.fraudRisk?.level || 'low']}
                        </div>
                        {profile.fraudRisk?.reasons?.length > 0 && (
                            <ul style={{
                                textAlign: 'left',
                                marginTop: '12px',
                                paddingLeft: '20px',
                                fontSize: '14px',
                                color: 'var(--text-muted)'
                            }}>
                                {profile.fraudRisk.reasons.map((reason, i) => (
                                    <li key={i}>{reason}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Details Column */}
                <div>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h1 style={{ marginBottom: '4px' }}>{profile.fullName}</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '18px', margin: 0 }}>
                                    {profile.age} years · {profile.gender === 'male' ? 'Male' : 'Female'}
                                </p>
                            </div>
                            <span className={`recognition-badge recognition-${profile.recognition?.level || 'new'}`} style={{ fontSize: '16px' }}>
                                {profile.recognition?.level?.toUpperCase() || 'NEW'} ({profile.recognition?.recogniserCount || 0})
                            </span>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

                        {/* Basic Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Personal Details</h4>
                                <InfoRow label="Caste" value={`${profile.caste}${profile.subCaste ? ` (${profile.subCaste})` : ''}`} />
                                <InfoRow label="Gotra" value={profile.gotra} />
                                <InfoRow label="Religion" value={profile.religion} />
                                <InfoRow label="Mother Tongue" value={profile.motherTongue} />
                                <InfoRow label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : null} />
                                <InfoRow label="Marital Status" value={profile.maritalStatus?.replace('_', ' ')} />
                            </div>

                            <div>
                                <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Location</h4>
                                <InfoRow label="City" value={profile.city} />
                                <InfoRow label="State" value={profile.state} />
                                <InfoRow label="Country" value={profile.country} />
                                <InfoRow label="Native Place" value={profile.nativePlace} />
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Education & Career</h4>
                                <InfoRow label="Education" value={profile.education} />
                                <InfoRow label="Details" value={profile.educationDetail} />
                                <InfoRow label="Profession" value={profile.profession} />
                                <InfoRow label="Company" value={profile.company} />
                                <InfoRow label="Income" value={profile.annualIncome} />
                            </div>

                            <div>
                                <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Family</h4>
                                <InfoRow label="Father" value={profile.fatherName} />
                                <InfoRow label="Father's Occupation" value={profile.fatherOccupation} />
                                <InfoRow label="Mother" value={profile.motherName} />
                                <InfoRow label="Siblings" value={profile.siblings} />
                                <InfoRow label="Family Type" value={profile.familyType} />
                            </div>
                        </div>

                        {/* Contact */}
                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
                        <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Contact</h4>
                        <InfoRow label="Phone" value={profile.phone} />
                        <InfoRow label="Alternate Phone" value={profile.alternatePhone} />
                        <InfoRow label="Email" value={profile.email} />
                    </div>

                    {/* Recognition Section */}
                    <RecognitionSection
                        profileId={profile._id}
                        recognition={profile.recognition}
                        isVerified={isVerified}
                        onRecognitionAdded={fetchProfile}
                    />
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    if (!value) return null;
    return (
        <div style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{label}:</span>{' '}
            <span style={{ fontWeight: '500' }}>{value}</span>
        </div>
    );
}

export default ProfileDetail;
