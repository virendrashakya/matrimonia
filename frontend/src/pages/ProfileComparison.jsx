import { useState } from 'react';
import { Card, Button, Row, Col, Typography, Empty, Input, Space, Tag, Avatar, Tooltip, Modal } from 'antd';
import { DeleteOutlined, WhatsAppOutlined, ShareAltOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { useShortlist } from '../context/ShortlistContext';
import { useLanguage } from '../context/LanguageContext';
import { shareMultipleProfiles } from '../utils/whatsappShare';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * Profile Comparison Page
 * Allows elders to compare shortlisted profiles side by side
 */
function ProfileComparison() {
    const { shortlist, removeFromShortlist, addNote, getNote, clearShortlist } = useShortlist();
    const { isHindi, t } = useLanguage();
    const [editingNote, setEditingNote] = useState(null);
    const [noteText, setNoteText] = useState('');

    const getInitials = (name) => {
        if (!name) return '?';
        const words = name.trim().split(/\s+/);
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    const getAge = (dob) => {
        if (!dob) return '-';
        return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
    };

    const handleSaveNote = (profileId) => {
        addNote(profileId, noteText);
        setEditingNote(null);
        setNoteText('');
    };

    const startEditNote = (profileId) => {
        setEditingNote(profileId);
        setNoteText(getNote(profileId));
    };

    if (shortlist.length === 0) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Empty
                    description={
                        <span style={{ fontSize: 18 }}>
                            {isHindi ? 'कोई प्रोफ़ाइल शॉर्टलिस्ट में नहीं' : 'No profiles in shortlist'}
                        </span>
                    }
                >
                    <Link to="/profiles">
                        <Button type="primary" size="large">
                            {isHindi ? 'प्रोफ़ाइल ब्राउज़ करें' : 'Browse Profiles'}
                        </Button>
                    </Link>
                </Empty>
            </div>
        );
    }

    const comparisonFields = [
        { key: 'education', label: 'Education', labelHi: 'शिक्षा' },
        { key: 'profession', label: 'Profession', labelHi: 'पेशा' },
        { key: 'annualIncome', label: 'Income', labelHi: 'आय' },
        { key: 'caste', label: 'Caste', labelHi: 'जाति' },
        { key: 'city', label: 'City', labelHi: 'शहर' },
        { key: 'maritalStatus', label: 'Marital Status', labelHi: 'वैवाहिक स्थिति' },
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: 16
            }}>
                <Title level={2} style={{ margin: 0 }}>
                    {isHindi ? `🔖 शॉर्टलिस्ट (${shortlist.length})` : `🔖 Shortlist (${shortlist.length})`}
                </Title>

                <Space wrap>
                    <Button
                        icon={<WhatsAppOutlined />}
                        onClick={() => shareMultipleProfiles(shortlist, isHindi ? 'hi' : 'en')}
                        style={{ background: '#25D366', borderColor: '#25D366', color: 'white' }}
                    >
                        {isHindi ? 'WhatsApp पर भेजें' : 'Share on WhatsApp'}
                    </Button>
                    <Button danger onClick={clearShortlist}>
                        {isHindi ? 'सूची खाली करें' : 'Clear All'}
                    </Button>
                </Space>
            </div>

            {/* Comparison Grid */}
            <Row gutter={[16, 16]}>
                {shortlist.map(profile => {
                    const primaryPhoto = profile.photos?.find(p => p.isPrimary)?.url || profile.photos?.[0]?.url;
                    const note = getNote(profile._id);

                    return (
                        <Col xs={24} sm={12} lg={8} xl={6} key={profile._id}>
                            <Card
                                className="comparison-card"
                                hoverable
                                actions={[
                                    <Tooltip title={isHindi ? 'नोट जोड़ें' : 'Add Note'}>
                                        <FileTextOutlined onClick={() => startEditNote(profile._id)} />
                                    </Tooltip>,
                                    <Tooltip title={isHindi ? 'हटाएं' : 'Remove'}>
                                        <DeleteOutlined onClick={() => removeFromShortlist(profile._id)} />
                                    </Tooltip>
                                ]}
                            >
                                {/* Photo/Avatar */}
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    {primaryPhoto ? (
                                        <Avatar size={80} src={primaryPhoto} />
                                    ) : (
                                        <Avatar
                                            size={80}
                                            style={{
                                                background: profile.gender === 'female'
                                                    ? 'linear-gradient(135deg, #EC4899, #DB2777)'
                                                    : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                                                fontSize: 28,
                                                fontWeight: 700
                                            }}
                                        >
                                            {getInitials(profile.fullName)}
                                        </Avatar>
                                    )}
                                    <Title level={4} style={{ margin: '8px 0 4px' }}>
                                        {profile.fullName}
                                    </Title>
                                    <Text type="secondary">
                                        {getAge(profile.dateOfBirth)} {isHindi ? 'वर्ष' : 'yrs'} • {profile.city}
                                    </Text>
                                </div>

                                {/* Comparison Fields */}
                                {comparisonFields.map(field => (
                                    <div className="comparison-row" key={field.key}>
                                        <span className="comparison-label">
                                            {isHindi ? field.labelHi : field.label}
                                        </span>
                                        <span className="comparison-value">
                                            {profile[field.key] || '-'}
                                        </span>
                                    </div>
                                ))}

                                {/* Note */}
                                {note && (
                                    <div style={{
                                        marginTop: 12,
                                        padding: 8,
                                        background: '#fff7e6',
                                        borderRadius: 8,
                                        fontSize: 12
                                    }}>
                                        📝 {note}
                                    </div>
                                )}

                                {/* View Profile Link */}
                                <Link to={`/profiles/${profile._id}`} style={{ display: 'block', marginTop: 12 }}>
                                    <Button type="primary" block>
                                        {isHindi ? 'पूरी प्रोफ़ाइल देखें' : 'View Full Profile'}
                                    </Button>
                                </Link>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Note Edit Modal */}
            <Modal
                title={isHindi ? '📝 नोट जोड़ें' : '📝 Add Note'}
                open={editingNote !== null}
                onOk={() => handleSaveNote(editingNote)}
                onCancel={() => setEditingNote(null)}
                okText={isHindi ? 'सेव करें' : 'Save'}
                cancelText={isHindi ? 'रद्द करें' : 'Cancel'}
            >
                <TextArea
                    rows={4}
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder={isHindi ? 'इस प्रोफ़ाइल के बारे में अपने विचार लिखें...' : 'Write your thoughts about this profile...'}
                />
            </Modal>
        </div>
    );
}

export default ProfileComparison;
