import { Link } from 'react-router-dom';

function ProfileCard({ profile }) {
    const levelColors = {
        new: 'recognition-new',
        low: 'recognition-low',
        moderate: 'recognition-moderate',
        high: 'recognition-high'
    };

    const levelLabels = {
        new: 'New',
        low: 'Low',
        moderate: 'Moderate',
        high: 'High Trust'
    };

    const riskIcons = {
        low: '✓',
        medium: '⚠',
        high: '✗'
    };

    const riskLevel = profile.fraudIndicators?.phoneReused ? 'medium' :
        (profile.recognition?.recogniserCount === 0 ? 'medium' : 'low');

    return (
        <Link to={`/profiles/${profile._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article className="profile-card">
                {profile.primaryPhoto ? (
                    <img
                        src={profile.primaryPhoto}
                        alt={profile.fullName}
                        className="profile-card-image"
                    />
                ) : (
                    <div className="profile-card-image" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        color: 'var(--text-muted)'
                    }}>
                        {profile.gender === 'male' ? '👤' : '👤'}
                    </div>
                )}

                <div className="profile-card-content">
                    <h3 className="profile-card-name">
                        {profile.fullName}, {profile.age}
                    </h3>
                    <p className="profile-card-info" style={{ marginBottom: '8px' }}>
                        {profile.caste} · {profile.city}
                    </p>
                    <p className="profile-card-info" style={{ marginBottom: '16px' }}>
                        {profile.education} · {profile.profession}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`recognition-badge ${levelColors[profile.recognition?.level || 'new']}`}>
                            {levelLabels[profile.recognition?.level || 'new']} ({profile.recognition?.recogniserCount || 0})
                        </span>

                        <span className={`risk-indicator risk-${riskLevel}`}>
                            {riskIcons[riskLevel]} {riskLevel === 'low' ? 'Looks good' : 'Verify'}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default ProfileCard;
