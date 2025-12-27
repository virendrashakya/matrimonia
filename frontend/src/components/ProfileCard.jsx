import { Link } from 'react-router-dom';
import { Card, Avatar, Tag, Typography, Space } from 'antd';
import { UserOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, HeartOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';

const { Text, Title } = Typography;

function ProfileCard({ profile }) {
    const { t, isHindi } = useLanguage();

    const levelConfig = {
        new: { color: 'default', label: t.profiles.new, gradient: 'linear-gradient(135deg, #9CA3AF, #6B7280)' },
        low: { color: 'orange', label: t.profiles.known, gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
        moderate: { color: 'green', label: t.profiles.trusted, gradient: 'linear-gradient(135deg, #10B981, #059669)' },
        high: { color: 'cyan', label: t.profiles.verified, gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)' }
    };

    const level = profile.recognition?.level || 'new';
    const riskLevel = profile.fraudIndicators?.phoneReused ? 'medium' :
        (profile.recognition?.recogniserCount === 0 ? 'medium' : 'low');

    const riskConfig = {
        low: { icon: <CheckCircleOutlined />, color: '#059669', bg: '#ECFDF5', text: t.profiles.good },
        medium: { icon: <WarningOutlined />, color: '#D97706', bg: '#FFFBEB', text: t.profiles.verify },
        high: { icon: <CloseCircleOutlined />, color: '#DC2626', bg: '#FEF2F2', text: t.profiles.caution }
    };

    // Gender-based colors
    const genderConfig = {
        male: {
            gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            lightGradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            icon: <ManOutlined />,
            color: '#1D4ED8'
        },
        female: {
            gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
            lightGradient: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)',
            icon: <WomanOutlined />,
            color: '#DB2777'
        }
    };
    const genderStyle = genderConfig[profile.gender] || genderConfig.male;

    const primaryPhoto = profile.photos?.find(p => p.isPrimary)?.url || profile.photos?.[0]?.url;

    // Get display name based on language
    const displayName = isHindi && profile.localContent?.fullName
        ? profile.localContent.fullName
        : profile.fullName;

    const displayCity = isHindi && profile.localContent?.city
        ? profile.localContent.city
        : profile.city;

    return (
        <Link to={`/profiles/${profile._id}`} style={{ textDecoration: 'none' }}>
            <Card
                hoverable
                style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(160, 21, 62, 0.08)',
                    transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: 0 }}
                className="profile-card-hover"
                cover={
                    <div style={{ position: 'relative' }}>
                        {primaryPhoto ? (
                            <img
                                alt={displayName}
                                src={primaryPhoto}
                                style={{
                                    height: 220,
                                    width: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div style={{
                                height: 220,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: genderStyle.lightGradient,
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: 100,
                                    opacity: 0.08
                                }}>
                                    💍
                                </div>
                                <Avatar
                                    size={80}
                                    icon={<UserOutlined />}
                                    style={{
                                        background: genderStyle.gradient,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                />
                            </div>
                        )}

                        {/* Gradient overlay for text readability */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 80,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                        }} />

                        {/* Recognition badge */}
                        <div style={{ position: 'absolute', top: 12, left: 12 }}>
                            <Tag
                                style={{
                                    background: levelConfig[level].gradient,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 20,
                                    padding: '4px 12px',
                                    fontWeight: 600,
                                    fontSize: 11,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                }}
                            >
                                ✨ {levelConfig[level].label}
                            </Tag>
                        </div>

                        {/* Gender indicator */}
                        <div style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            background: genderStyle.gradient,
                            color: 'white',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}>
                            {genderStyle.icon}
                        </div>

                        {/* Photo count */}
                        {profile.photos?.length > 1 && (
                            <div style={{
                                position: 'absolute',
                                bottom: 50,
                                right: 12,
                                background: 'rgba(255,255,255,0.9)',
                                color: '#2C1810',
                                padding: '4px 10px',
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 600,
                                backdropFilter: 'blur(4px)',
                            }}>
                                📷 {profile.photos.length}
                            </div>
                        )}

                        {/* Name & Age on photo */}
                        <div style={{
                            position: 'absolute',
                            bottom: 12,
                            left: 12,
                            right: 12,
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                            }}>
                                <div>
                                    <div style={{
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: 700,
                                        textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                                    }}>
                                        {displayName}
                                    </div>
                                    <div style={{
                                        color: 'rgba(255,255,255,0.9)',
                                        fontSize: 12,
                                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                    }}>
                                        {displayCity}
                                    </div>
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #A0153E, #7A0F2E)',
                                    color: 'white',
                                    padding: '6px 14px',
                                    borderRadius: 20,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    boxShadow: '0 2px 8px rgba(160,21,62,0.4)',
                                }}>
                                    {profile.age} {t.profiles.years}
                                </div>
                            </div>
                        </div>
                    </div>
                }
            >
                <div style={{ padding: 16 }}>
                    {/* Caste & Education */}
                    <div style={{
                        background: 'linear-gradient(135deg, #FFF8F0, #FFF5EB)',
                        padding: '12px 14px',
                        borderRadius: 12,
                        marginBottom: 12,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 14 }}>🛕</span>
                            <Text strong style={{ fontSize: 13, color: '#A0153E' }}>
                                {profile.caste}
                            </Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 14 }}>🎓</span>
                            <Text style={{ fontSize: 12, color: '#6B7280' }}>
                                {isHindi && profile.localContent?.education ? profile.localContent.education : profile.education}
                            </Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14 }}>💼</span>
                            <Text style={{ fontSize: 12, color: '#6B7280' }}>
                                {isHindi && profile.localContent?.profession ? profile.localContent.profession : profile.profession}
                            </Text>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: 12,
                        borderTop: '1px dashed #E5D4C0'
                    }}>
                        <Space size={6}>
                            <div style={{
                                background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                                borderRadius: 8,
                                padding: '4px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                            }}>
                                <HeartOutlined style={{ color: '#D97706', fontSize: 12 }} />
                                <Text style={{ fontSize: 11, color: '#92400E', fontWeight: 600 }}>
                                    {profile.recognition?.recogniserCount || 0}
                                </Text>
                            </div>
                        </Space>
                        <div style={{
                            background: riskConfig[riskLevel].bg,
                            color: riskConfig[riskLevel].color,
                            fontSize: 11,
                            padding: '4px 10px',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontWeight: 600
                        }}>
                            {riskConfig[riskLevel].icon}
                            <span>{riskConfig[riskLevel].text}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

export default ProfileCard;
