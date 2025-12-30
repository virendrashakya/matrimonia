import { Link } from 'react-router-dom';
import { Card, Avatar, Tag, Typography, Space, Tooltip, Button, Grid } from 'antd';
import { UserOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, HeartOutlined, ManOutlined, WomanOutlined, GlobalOutlined, LockOutlined, EyeInvisibleOutlined, StarOutlined, StarFilled, WhatsAppOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';
import { useShortlist } from '../context/ShortlistContext';
import { shareViaWhatsApp } from '../utils/whatsappShare';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

function ProfileCard({ profile, viewMode = 'grid' }) {
    const { t, isHindi } = useLanguage();
    const { isShortlisted, addToShortlist, removeFromShortlist } = useShortlist();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

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

    const isList = viewMode === 'list';

    // Responsive adjustments
    const cardFlexDir = isList && !isMobile ? 'row' : 'column';
    const contentGap = isList && !isMobile ? 24 : 16;

    return (
        <Link to={`/profiles/${profile._id}`} style={{ textDecoration: 'none' }}>
            <Card
                hoverable
                style={{
                    borderRadius: 16,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                bodyStyle={{
                    padding: 16,
                    flex: 1,
                    display: 'flex',
                    flexDirection: cardFlexDir,
                    gap: contentGap,
                    alignItems: isList && !isMobile ? 'center' : 'stretch'
                }}
                className="profile-card-hover"
            >
                {/* Header Section: Avatar + Basic Info */}
                <div style={{
                    display: 'flex',
                    gap: 16,
                    marginBottom: isList ? 0 : 16,
                    position: 'relative',
                    flex: isList ? '0 0 auto' : 'initial'
                }}>
                    {/* Avatar Area */}
                    <div style={{ position: 'relative' }}>
                        <div className="watermarked-image-container" style={{ borderRadius: '50%', overflow: 'hidden', width: isList ? 64 : 84, height: isList ? 64 : 84, display: 'flex' }}>
                            <Avatar
                                size={isList ? 64 : 84}
                                src={primaryPhoto}
                                style={{
                                    background: genderStyle.gradient,
                                    border: '3px solid white',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    fontSize: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {initials}
                            </Avatar>
                        </div>

                        {/* Gender Badge on Avatar */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            background: 'white',
                            borderRadius: '50%',
                            padding: 2,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: genderStyle.gradient,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12
                            }}>
                                {genderStyle.icon}
                            </div>
                        </div>
                    </div>

                    {/* Info Area (Only used in Grid mode here, hidden in List mode to avoid double rendering) */}
                    {!isList && (
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <div style={{ flex: 1, marginRight: 8, minWidth: 0 }}>
                                    <Text strong style={{ fontSize: 18, color: '#1F2937', display: 'block', lineHeight: 1.2, marginBottom: 2, width: '100%' }} ellipsis>
                                        {displayName}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ fontSize: 14, flexShrink: 0 }}>📍</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.45)', width: '100%', display: 'block' }} ellipsis>
                                                {displayCity}
                                            </Text>
                                        </div>
                                    </Text>
                                </div>

                                {/* Recognition Badge (Compact) */}
                                <Tooltip title={levelConfig[level].label}>
                                    <Tag color={levelConfig[level].color === 'default' ? 'default' : levelConfig[level].color} style={{ margin: 0, borderRadius: 12, fontSize: 10, fontWeight: 600 }}>
                                        {level === 'new' ? '✨ NEW' : '✨ ' + levelConfig[level].label.toUpperCase()}
                                    </Tag>
                                </Tooltip>
                            </div>

                            {/* Age & ID */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                <Tag style={{
                                    margin: 0,
                                    borderRadius: 20,
                                    background: '#FFF0F5',
                                    border: 'none',
                                    color: '#A0153E',
                                    fontWeight: 600,
                                    padding: '0 10px'
                                }}>
                                    {profile.age} {t.profiles.years}
                                </Tag>
                                {profile.photos?.length > 1 && (
                                    <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#D1D5DB' }} />
                                        <span>📷 {profile.photos.length}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* List View Main Info Content */}
                {isList && (
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Text strong style={{ fontSize: 18, color: '#1F2937', lineHeight: 1 }}>
                                {displayName}
                            </Text>
                            <Tag color={levelConfig[level].color === 'default' ? 'default' : levelConfig[level].color} style={{ borderRadius: 12, fontSize: 10, fontWeight: 600, margin: 0 }}>
                                {level === 'new' ? 'NEW' : levelConfig[level].label.toUpperCase()}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                {profile.age} {t.profiles.years} • {profile.heightCm ? `${profile.heightCm}cm` : ''}
                            </Text>
                        </div>

                        {/* Compact Grid for Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '4px 12px', fontSize: 13, marginTop: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>📍</span>
                                <Text ellipsis style={{ color: '#4B5563' }}>{displayCity}</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>🛕</span>
                                <Text ellipsis style={{ color: '#A0153E', fontWeight: 500 }}>{profile.caste}</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>💍</span>
                                <Text ellipsis style={{ color: '#4B5563' }}>{profile.maritalStatus || 'Never Married'}</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>🎓</span>
                                <Text ellipsis style={{ color: '#4B5563' }}>{isHindi && profile.localContent?.education ? profile.localContent.education : profile.education}</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>💼</span>
                                <Text ellipsis style={{ color: '#4B5563' }}>{isHindi && profile.localContent?.profession ? profile.localContent.profession : profile.profession}</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>💰</span>
                                <Text ellipsis style={{ color: '#4B5563' }}>{profile.annualIncome || '-'}</Text>
                            </div>
                        </div>
                    </div>
                )}


                {/* Content Section (Hidden in List Mode as it's merged above, shown in Grid) */}
                {!isList && (
                    <div style={{ flex: 1 }}>
                        {/* Caste & Education */}
                        <div style={{
                            background: 'linear-gradient(135deg, #FFF8F0, #FFF5EB)',
                            padding: '12px 14px',
                            borderRadius: 12,
                            marginBottom: 12,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>🛕</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text strong style={{ fontSize: 13, color: '#A0153E', width: '100%', display: 'block' }} ellipsis>
                                        {profile.caste}
                                    </Text>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>🎓</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontSize: 12, color: '#6B7280', width: '100%', display: 'block' }} ellipsis>
                                        {isHindi && profile.localContent?.education ? profile.localContent.education : profile.education}
                                    </Text>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>💼</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{ fontSize: 12, color: '#6B7280', width: '100%', display: 'block' }} ellipsis>
                                        {isHindi && profile.localContent?.profession ? profile.localContent.profession : profile.profession}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer: Stats & Actions */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginTop: isList ? (isMobile ? 12 : 0) : 12,
                    paddingTop: isList ? (isMobile ? 12 : 0) : 12,
                    borderTop: isList ? (isMobile ? '1px dashed #E5D4C0' : 'none') : '1px dashed #E5D4C0',
                    flex: isList && !isMobile ? '0 0 auto' : 'initial',
                    marginLeft: isList && !isMobile ? 24 : 0,
                    width: isList && !isMobile ? 'auto' : '100%'
                }}>
                    {/* Stats / Risk (Hidden in List for cleaner look, or keep if needed. Let's keep minimal stats for list) */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexDirection: isList ? 'column' : 'row' }}>
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

                        {!isList && (
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
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexDirection: isList && !isMobile ? 'column' : 'row' }}>
                        <Tooltip title={isShortlisted(profile._id) ? (isHindi ? 'शॉर्टलिस्ट से हटाएं' : 'Remove from shortlist') : (isHindi ? 'शॉर्टलिस्ट में जोड़ें' : 'Add to shortlist')}>
                            <Button
                                size={isList ? "middle" : "small"}
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
                                size={isList ? "middle" : "small"}
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
