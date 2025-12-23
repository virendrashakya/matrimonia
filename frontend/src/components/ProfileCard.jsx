import { Link } from 'react-router-dom';
import { Card, Avatar, Tag, Typography, Space } from 'antd';
import { UserOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, HeartOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';

const { Text, Title } = Typography;

function ProfileCard({ profile }) {
    const { t, isHindi } = useLanguage();

    const levelConfig = {
        new: { color: 'default', label: t.profiles.new },
        low: { color: 'orange', label: t.profiles.known },
        moderate: { color: 'green', label: t.profiles.trusted },
        high: { color: 'cyan', label: t.profiles.verified }
    };

    const level = profile.recognition?.level || 'new';
    const riskLevel = profile.fraudIndicators?.phoneReused ? 'medium' :
        (profile.recognition?.recogniserCount === 0 ? 'medium' : 'low');

    const riskConfig = {
        low: { icon: <CheckCircleOutlined />, color: '#059669', text: t.profiles.good },
        medium: { icon: <WarningOutlined />, color: '#D97706', text: t.profiles.verify },
        high: { icon: <CloseCircleOutlined />, color: '#DC2626', text: t.profiles.caution }
    };

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
                style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #F3E8D8' }}
                bodyStyle={{ padding: 0 }}
                cover={
                    <div style={{ position: 'relative' }}>
                        {primaryPhoto ? (
                            <img alt={displayName} src={primaryPhoto} style={{ height: 200, width: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5EB, #FFF8F0)' }}>
                                <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#E5D4C0' }} />
                            </div>
                        )}

                        {/* Recognition badge */}
                        <div style={{ position: 'absolute', top: 12, left: 12 }}>
                            <Tag
                                color={level === 'high' ? undefined : levelConfig[level].color}
                                style={{
                                    background: level === 'high' ? 'linear-gradient(135deg, #059669, #047857)' : undefined,
                                    color: level === 'high' ? 'white' : undefined,
                                    border: 'none',
                                    borderRadius: 16,
                                    padding: '2px 10px',
                                    fontWeight: 600,
                                    fontSize: 10,
                                }}
                            >
                                {levelConfig[level].label}
                            </Tag>
                        </div>

                        {/* Photo count */}
                        {profile.photos?.length > 1 && (
                            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>
                                📷 {profile.photos.length}
                            </div>
                        )}

                        {/* Age badge */}
                        <div style={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            background: 'linear-gradient(135deg, #A0153E, #7A0F2E)',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: 16,
                            fontSize: 13,
                            fontWeight: 600,
                        }}>
                            {profile.age} {t.profiles.years}
                        </div>
                    </div>
                }
            >
                <div style={{ padding: 14 }}>
                    <div style={{ marginBottom: 10 }}>
                        <Title level={5} style={{ margin: 0, fontSize: 15 }}>{displayName}</Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            {profile.gender === 'male' ? '♂️' : '♀️'} {profile.caste} · {displayCity}
                        </Text>
                    </div>

                    {/* Education & Profession */}
                    <div style={{ background: '#FFF8F0', padding: '8px 10px', borderRadius: 8, marginBottom: 10, fontSize: 12 }}>
                        <div>🎓 {isHindi && profile.localContent?.education ? profile.localContent.education : profile.education}</div>
                        <div>💼 {isHindi && profile.localContent?.profession ? profile.localContent.profession : profile.profession}</div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #F3E8D8' }}>
                        <Space size={4}>
                            <HeartOutlined style={{ color: '#D4AF37', fontSize: 12 }} />
                            <Text style={{ fontSize: 12, color: '#8B7355' }}>
                                {profile.recognition?.recogniserCount || 0} {t.profiles.recognitions}
                            </Text>
                        </Space>
                        <Space style={{ color: riskConfig[riskLevel].color, fontSize: 12 }}>
                            {riskConfig[riskLevel].icon}
                            <Text style={{ color: riskConfig[riskLevel].color, fontSize: 12 }}>
                                {riskConfig[riskLevel].text}
                            </Text>
                        </Space>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

export default ProfileCard;
