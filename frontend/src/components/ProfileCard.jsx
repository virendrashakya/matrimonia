import { Link } from 'react-router-dom';
import { Card, Avatar, Tag, Typography, Space, Tooltip, Button } from 'antd';
import { UserOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, HeartOutlined, ManOutlined, WomanOutlined, GlobalOutlined, LockOutlined, EyeInvisibleOutlined, StarOutlined, StarFilled, WhatsAppOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';
import { useShortlist } from '../context/ShortlistContext';
import { shareViaWhatsApp } from '../utils/whatsappShare';

const { Text, Title } = Typography;

function ProfileCard({ profile }) {
    const { t, isHindi } = useLanguage();
    const { isShortlisted, addToShortlist, removeFromShortlist } = useShortlist();

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

    // Visibility config
    const visibilityConfig = {
        public: { icon: <GlobalOutlined />, color: '#52c41a', label: '🌐' },
        restricted: { icon: <LockOutlined />, color: '#fa8c16', label: '🔐' },
        private: { icon: <EyeInvisibleOutlined />, color: '#ff4d4f', label: '🔒' }
    };
    const visibility = profile.visibility || 'public';
    const visStyle = visibilityConfig[visibility];

    const primaryPhoto = profile.photos?.find(p => p.isPrimary)?.url || profile.photos?.[0]?.url;

    // Get display name based on language
    const displayName = isHindi && profile.localContent?.fullName
        ? profile.localContent.fullName
        : profile.fullName;

    const displayCity = isHindi && profile.localContent?.city
        ? profile.localContent.city
        : profile.city;

    // Generate initials from name (e.g., "Virendra Shakya" -> "VS")
    const getInitials = (name) => {
        if (!name) return '?';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };
    const initials = getInitials(profile.fullName);

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
                                    style={{
                                        background: genderStyle.gradient,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        fontSize: 32,
                                        fontWeight: 700,
                                        color: 'white'
                                    }}
                                >
                                    {initials}
                                </Avatar>
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

                        {/* Visibility badge */}
                        {visibility !== 'public' && (
                            <Tooltip title={visibility === 'restricted' ? 'Requires approval' : 'Private'}>
                                <div style={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    background: 'rgba(255,255,255,0.9)',
                                    borderRadius: '50%',
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    fontSize: 14
                                }}>
                                    {visStyle.label}
                                </div>
                            </Tooltip>
                        )}

                        {/* Gender indicator */}
                        <div style={{
                            position: 'absolute',
                            top: 12,
                            right: visibility !== 'public' ? 48 : 12,
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

                    {/* Quick Actions */}
                    <div style={{
                        display: 'flex',
                        gap: 8,
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: '1px solid #f0f0f0'
                    }}>
                        <Tooltip title={isShortlisted(profile._id) ? (isHindi ? 'शॉर्टलिस्ट से हटाएं' : 'Remove from shortlist') : (isHindi ? 'शॉर्टलिस्ट में जोड़ें' : 'Add to shortlist')}>
                            <Button
                                size="small"
                                type={isShortlisted(profile._id) ? 'primary' : 'default'}
                                icon={isShortlisted(profile._id) ? <StarFilled /> : <StarOutlined />}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    isShortlisted(profile._id)
                                        ? removeFromShortlist(profile._id)
                                        : addToShortlist(profile);
                                }}
                                style={isShortlisted(profile._id) ? { background: '#D4AF37', borderColor: '#D4AF37' } : {}}
                            />
                        </Tooltip>
                        <Tooltip title={isHindi ? 'WhatsApp पर शेयर करें' : 'Share on WhatsApp'}>
                            <Button
                                size="small"
                                type="primary"
                                className="whatsapp-share-btn"
                                icon={<WhatsAppOutlined />}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    shareViaWhatsApp(profile, isHindi ? 'hi' : 'en');
                                }}
                            />
                        </Tooltip>
                    </div>
                </div>
            </Card >
        </Link >
    );
}

export default ProfileCard;
