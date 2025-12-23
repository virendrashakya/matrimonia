import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Tag, Spin, Empty, Descriptions, Avatar, Divider, List, Button, Space, Tabs, Badge } from 'antd';
import {
    UserOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    CloseCircleOutlined,
    HeartOutlined,
    HomeOutlined,
    BookOutlined,
    PhoneOutlined,
    MailOutlined,
    EditOutlined,
    StarOutlined,
    EnvironmentOutlined,
    ManOutlined,
    WomanOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import RecognitionSection from '../components/RecognitionSection';
import PhotoGallery from '../components/PhotoGallery';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;

// Helper to get display value
const getDisplayValue = (profile, field, localField, isHindi) => {
    if (isHindi && profile.localContent?.[localField || field]) {
        return profile.localContent[localField || field];
    }
    return profile[field] || '-';
};

// Rashi labels
const RASHI_LABELS = {
    mesh: 'Mesh (मेष)', vrishabh: 'Vrishabh (वृषभ)', mithun: 'Mithun (मिथुन)',
    kark: 'Kark (कर्क)', simha: 'Simha (सिंह)', kanya: 'Kanya (कन्या)',
    tula: 'Tula (तुला)', vrishchik: 'Vrishchik (वृश्चिक)', dhanu: 'Dhanu (धनु)',
    makar: 'Makar (मकर)', kumbh: 'Kumbh (कुंभ)', meen: 'Meen (मीन)'
};

function ProfileDetail() {
    const { id } = useParams();
    const { isVerified, user } = useAuth();
    const { t, isHindi } = useLanguage();
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

    const riskConfig = {
        low: { icon: <CheckCircleOutlined />, color: '#059669', text: 'Profile looks trustworthy', bgColor: '#D1FAE5' },
        medium: { icon: <WarningOutlined />, color: '#D97706', text: 'Verify before proceeding', bgColor: '#FEF3C7' },
        high: { icon: <CloseCircleOutlined />, color: '#DC2626', text: 'Exercise caution', bgColor: '#FEE2E2' }
    };

    const levelConfig = {
        new: { color: 'default', label: 'NEW' },
        low: { color: 'orange', label: 'KNOWN' },
        moderate: { color: 'green', label: 'TRUSTED' },
        high: { color: 'cyan', label: 'VERIFIED' }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ padding: '32px 0' }}>
                <Empty description="Profile not found">
                    <Link to="/profiles"><Button type="primary">Back to Profiles</Button></Link>
                </Empty>
            </div>
        );
    }

    const riskLevel = profile.fraudRisk?.level || 'low';

    // Fix: Handle both populated and unpopulated createdBy
    const createdById = typeof profile.createdBy === 'object'
        ? profile.createdBy?._id
        : profile.createdBy;
    const isOwner = createdById?.toString() === user?._id?.toString();
    const isAdminOrMod = ['admin', 'moderator'].includes(user?.role);
    const canEdit = isOwner || isAdminOrMod;

    console.log('Permission check:', { createdById, userId: user?._id, isOwner, isAdminOrMod, canEdit });

    const tabItems = [
        {
            key: 'overview',
            label: 'Overview',
            children: (
                <Row gutter={24}>
                    {/* Personal Details */}
                    <Col xs={24} md={12}>
                        <Card title={<><UserOutlined /> Personal Details</>} size="small" style={{ marginBottom: 16 }}>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Caste / जाति">{getDisplayValue(profile, 'caste', 'caste', isHindi)}</Descriptions.Item>
                                <Descriptions.Item label="Sub-Caste">{getDisplayValue(profile, 'subCaste', 'subCaste', isHindi) || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Gotra / गोत्र">{getDisplayValue(profile, 'gotra', 'gotra', isHindi) || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Religion">{profile.religion || 'Hindu'}</Descriptions.Item>
                                <Descriptions.Item label="Mother Tongue">{profile.motherTongue || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Marital Status">
                                    <Tag color={profile.maritalStatus === 'never_married' ? 'green' : 'orange'}>
                                        {profile.maritalStatus?.replace(/_/g, ' ').toUpperCase() || '-'}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Physical & Lifestyle */}
                    <Col xs={24} md={12}>
                        <Card title={<><UserOutlined /> Physical & Lifestyle</>} size="small" style={{ marginBottom: 16 }}>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Height">{profile.heightCm ? `${profile.heightCm} cm` : '-'}</Descriptions.Item>
                                <Descriptions.Item label="Weight">{profile.weightKg ? `${profile.weightKg} kg` : '-'}</Descriptions.Item>
                                <Descriptions.Item label="Complexion">{profile.complexion?.replace(/_/g, ' ') || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Body Type">{profile.bodyType || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Diet">
                                    <Tag color={profile.diet === 'vegetarian' ? 'green' : 'orange'}>
                                        {profile.diet?.replace(/_/g, ' ').toUpperCase() || 'Vegetarian'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Smoking / Drinking">
                                    {profile.smoking || 'No'} / {profile.drinking || 'No'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Education & Career */}
                    <Col xs={24} md={12}>
                        <Card title={<><BookOutlined /> Education & Career</>} size="small" style={{ marginBottom: 16 }}>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Education">{getDisplayValue(profile, 'education', 'education', isHindi)}</Descriptions.Item>
                                <Descriptions.Item label="Profession">{getDisplayValue(profile, 'profession', 'profession', isHindi)}</Descriptions.Item>
                                <Descriptions.Item label="Company">{getDisplayValue(profile, 'company', 'company', isHindi) || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Annual Income">{profile.annualIncome || '-'}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Location */}
                    <Col xs={24} md={12}>
                        <Card title={<><EnvironmentOutlined /> Location</>} size="small" style={{ marginBottom: 16 }}>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="City">{getDisplayValue(profile, 'city', 'city', isHindi)}</Descriptions.Item>
                                <Descriptions.Item label="State">{getDisplayValue(profile, 'state', 'state', isHindi)}</Descriptions.Item>
                                <Descriptions.Item label="Country">{profile.country || 'India'}</Descriptions.Item>
                                <Descriptions.Item label="Native Place">{getDisplayValue(profile, 'nativePlace', 'nativePlace', isHindi) || '-'}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: 'family',
            label: 'Family',
            children: (
                <Card title={<><HomeOutlined /> Family Details</>}>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Descriptions column={1} size="small" title="Parents">
                                <Descriptions.Item label="Father's Name">{getDisplayValue(profile, 'fatherName', 'fatherName', isHindi) || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Father's Status">{profile.fatherStatus?.replace(/_/g, ' ') || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Father's Occupation">{profile.fatherOccupation || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Mother's Name">{getDisplayValue(profile, 'motherName', 'motherName', isHindi) || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Mother's Status">{profile.motherStatus?.replace(/_/g, ' ') || '-'}</Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col xs={24} md={12}>
                            <Descriptions column={1} size="small" title="Siblings & Family">
                                <Descriptions.Item label="Brothers">{profile.brothersCount || 0} ({profile.brothersMarried || 0} married)</Descriptions.Item>
                                <Descriptions.Item label="Sisters">{profile.sistersCount || 0} ({profile.sistersMarried || 0} married)</Descriptions.Item>
                                <Descriptions.Item label="Family Type">
                                    <Tag>{profile.familyType?.toUpperCase() || 'NUCLEAR'}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Family Status">{profile.familyStatus?.replace(/_/g, ' ') || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Family Values">{profile.familyValues || '-'}</Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </Card>
            ),
        },
        {
            key: 'horoscope',
            label: <><StarOutlined /> Horoscope</>,
            children: (
                <Card title={<><StarOutlined /> Horoscope / कुंडली</>}>
                    {profile.horoscope?.rashi || profile.horoscope?.nakshatra ? (
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Rashi / राशि">
                                        <Tag color="purple">{RASHI_LABELS[profile.horoscope?.rashi] || profile.horoscope?.rashi || '-'}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Nakshatra / नक्षत्र">{profile.horoscope?.nakshatra?.replace(/_/g, ' ') || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Manglik Status">
                                        <Tag color={profile.horoscope?.manglikStatus === 'manglik' ? 'red' : 'green'}>
                                            {profile.horoscope?.manglikStatus?.replace(/_/g, ' ').toUpperCase() || "DON'T KNOW"}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col xs={24} md={12}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Birth Time">{profile.horoscope?.birthTime || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Birth Place">{profile.horoscope?.birthPlace || '-'}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    ) : (
                        <Empty description="Horoscope details not provided" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Card>
            ),
        },
        {
            key: 'preferences',
            label: <><HeartOutlined /> Preferences</>,
            children: (
                <Card title={<><HeartOutlined /> Partner Preferences / जीवनसाथी की पसंद</>}>
                    {profile.preferences ? (
                        <Row gutter={24}>
                            <Col xs={24} md={8}>
                                <Descriptions column={1} size="small" title="Age & Physical">
                                    <Descriptions.Item label="Age Range">
                                        {profile.preferences.ageMin || '18'} - {profile.preferences.ageMax || '35'} years
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Height Range">
                                        {profile.preferences.heightMin || '-'} - {profile.preferences.heightMax || '-'} cm
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Body Type">
                                        {profile.preferences.bodyType?.join(', ') || 'Any'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col xs={24} md={8}>
                                <Descriptions column={1} size="small" title="Background">
                                    <Descriptions.Item label="Marital Status">
                                        {profile.preferences.maritalStatus?.join(', ') || 'Any'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Caste">
                                        {profile.preferences.caste?.length > 0 ? profile.preferences.caste.join(', ') : 'Any'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="State">
                                        {profile.preferences.state?.length > 0 ? profile.preferences.state.join(', ') : 'Any'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col xs={24} md={8}>
                                <Descriptions column={1} size="small" title="Lifestyle">
                                    <Descriptions.Item label="Diet">{profile.preferences.diet?.join(', ') || 'Any'}</Descriptions.Item>
                                    <Descriptions.Item label="Smoking">{profile.preferences.smoking?.join(', ') || 'Any'}</Descriptions.Item>
                                    <Descriptions.Item label="Drinking">{profile.preferences.drinking?.join(', ') || 'Any'}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                            {profile.preferences.aboutPartner && (
                                <Col xs={24}>
                                    <Divider />
                                    <Text strong>About Preferred Partner:</Text>
                                    <Paragraph style={{ marginTop: 8 }}>{profile.preferences.aboutPartner}</Paragraph>
                                </Col>
                            )}
                        </Row>
                    ) : (
                        <Empty description="Partner preferences not specified" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Card>
            ),
        },
    ];

    return (
        <div style={{ padding: '32px 0' }}>
            {/* Back button */}
            <Link to="/profiles" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, color: '#A0153E', fontWeight: 500 }}>
                <ArrowLeftOutlined /> Back to Profiles
            </Link>

            <Row gutter={24}>
                {/* Left Column - Photo & Quick Info */}
                <Col xs={24} md={8}>
                    {/* Photo Gallery */}
                    <PhotoGallery
                        profileId={profile._id}
                        photos={profile.photos || []}
                        onPhotosUpdated={fetchProfile}
                        editable={canEdit}
                    />

                    {/* Risk Card */}
                    <Card
                        style={{ borderRadius: 12, background: riskConfig[riskLevel].bgColor, border: 'none', marginBottom: 16 }}
                        bodyStyle={{ textAlign: 'center', padding: 16 }}
                    >
                        <div style={{ fontSize: 28, marginBottom: 4, color: riskConfig[riskLevel].color }}>
                            {riskConfig[riskLevel].icon}
                        </div>
                        <Text style={{ color: riskConfig[riskLevel].color, fontWeight: 600 }}>
                            {riskConfig[riskLevel].text}
                        </Text>
                    </Card>

                    {/* Contact Card */}
                    <Card title={<><PhoneOutlined /> Contact</>} size="small" style={{ marginBottom: 16 }}>
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <div><PhoneOutlined style={{ color: '#A0153E', marginRight: 8 }} /><Text copyable>{profile.phone}</Text></div>
                            {profile.alternatePhone && <div><PhoneOutlined style={{ marginRight: 8 }} />{profile.alternatePhone}</div>}
                            {profile.email && <div><MailOutlined style={{ color: '#A0153E', marginRight: 8 }} />{profile.email}</div>}
                        </Space>
                    </Card>

                    {/* About Me */}
                    {profile.aboutMe && (
                        <Card title="About Me / मेरे बारे में" size="small" style={{ marginBottom: 16 }}>
                            <Paragraph>{profile.aboutMe}</Paragraph>
                        </Card>
                    )}

                    {/* Hobbies & Languages */}
                    {(profile.hobbies?.length > 0 || profile.languages?.length > 0) && (
                        <Card title="Interests" size="small" style={{ marginBottom: 16 }}>
                            {profile.hobbies?.length > 0 && (
                                <div style={{ marginBottom: 8 }}>
                                    <Text type="secondary">Hobbies: </Text>
                                    {profile.hobbies.map(h => <Tag key={h}>{h}</Tag>)}
                                </div>
                            )}
                            {profile.languages?.length > 0 && (
                                <div>
                                    <Text type="secondary">Languages: </Text>
                                    {profile.languages.map(l => <Tag key={l} color="blue">{l}</Tag>)}
                                </div>
                            )}
                        </Card>
                    )}
                </Col>

                {/* Right Column - Details */}
                <Col xs={24} md={16}>
                    {/* Header Card */}
                    <Card style={{ borderRadius: 12, marginBottom: 24, background: 'linear-gradient(135deg, #FFFBF5, #FFF8F0)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    {profile.gender === 'male' ? <ManOutlined style={{ fontSize: 24, color: '#1890ff' }} /> : <WomanOutlined style={{ fontSize: 24, color: '#eb2f96' }} />}
                                    <Title level={2} style={{ margin: 0 }}>
                                        {isHindi && profile.localContent?.fullName ? profile.localContent.fullName : profile.fullName}
                                    </Title>
                                    <Tag color={levelConfig[profile.recognition?.level || 'new'].color} style={{ borderRadius: 20 }}>
                                        {levelConfig[profile.recognition?.level || 'new'].label}
                                    </Tag>
                                </div>
                                <Space size={16} wrap>
                                    <Text style={{ fontSize: 16 }}>{profile.age} years</Text>
                                    <Text type="secondary"><EnvironmentOutlined /> {profile.city}, {profile.state}</Text>
                                    <Text type="secondary"><BookOutlined /> {profile.education}</Text>
                                </Space>
                            </div>
                            {canEdit && (
                                <Link to={`/profiles/${profile._id}/edit`}>
                                    <Button icon={<EditOutlined />}>Edit</Button>
                                </Link>
                            )}
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        <Row gutter={[24, 16]}>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, color: '#A0153E', fontWeight: 600 }}>{profile.recognition?.score?.toFixed(1) || '0.0'}</div>
                                <Text type="secondary">Recognition Score</Text>
                            </Col>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, color: '#D4AF37', fontWeight: 600 }}><HeartOutlined /> {profile.recognition?.recogniserCount || 0}</div>
                                <Text type="secondary">People Recognise</Text>
                            </Col>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, color: '#059669', fontWeight: 600 }}>{profile.photos?.length || 0}</div>
                                <Text type="secondary">Photos</Text>
                            </Col>
                        </Row>
                    </Card>

                    {/* Tabbed Details */}
                    <Tabs items={tabItems} defaultActiveKey="overview" />

                    {/* Recognition Section */}
                    <div style={{ marginTop: 24 }}>
                        <RecognitionSection
                            profileId={profile._id}
                            recognition={profile.recognition}
                            isVerified={isVerified}
                            onRecognitionAdded={fetchProfile}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default ProfileDetail;
