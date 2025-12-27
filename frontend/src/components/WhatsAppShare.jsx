/**
 * WhatsAppShare - Enhanced WhatsApp share with templates
 */

import React, { useState } from 'react';
import { Modal, Button, Radio, Space, Typography, Input, message } from 'antd';
import { WhatsAppOutlined, CopyOutlined, SendOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

// Share templates
const getTemplates = (profile, profileUrl, isHindi) => ({
    short: {
        label: isHindi ? 'संक्षिप्त' : 'Short',
        text: isHindi
            ? `*${profile.fullName}*\n${profile.age} वर्ष | ${profile.city}\n${profile.education} | ${profile.profession}\nजाति: ${profile.caste}\n\n👉 प्रोफ़ाइल देखें: ${profileUrl}\n\n_Pehchan पर भेजा गया_`
            : `*${profile.fullName}*\n${profile.age} yrs | ${profile.city}\n${profile.education} | ${profile.profession}\nCaste: ${profile.caste}\n\n👉 View Profile: ${profileUrl}\n\n_Shared via Pehchan_`
    },
    detailed: {
        label: isHindi ? 'विस्तृत' : 'Detailed',
        text: isHindi
            ? `🔔 *नई प्रोफ़ाइल - ${profile.gender === 'male' ? 'लड़का' : 'लड़की'}*\n\n*नाम:* ${profile.fullName}\n*आयु:* ${profile.age} वर्ष\n*शहर:* ${profile.city}, ${profile.state}\n\n*शिक्षा:* ${profile.education}\n*पेशा:* ${profile.profession}\n${profile.annualIncome ? `*वार्षिक आय:* ${profile.annualIncome}` : ''}\n\n*जाति:* ${profile.caste}\n${profile.gotra ? `*गोत्र:* ${profile.gotra}` : ''}\n\n${profile.horoscope?.rashi ? `*राशि:* ${profile.horoscope.rashi}` : ''}\n${profile.horoscope?.manglikStatus ? `*मांगलिक:* ${profile.horoscope.manglikStatus}` : ''}\n\n📱 *संपर्क करें:*\n${profile.phone}\n\n👉 *पूरी प्रोफ़ाइल देखें:*\n${profileUrl}\n\n━━━━━━━━━━━━━━━\n_Pehchan - विश्वसनीय रिश्ते_`
            : `🔔 *New Profile - ${profile.gender === 'male' ? 'Groom' : 'Bride'}*\n\n*Name:* ${profile.fullName}\n*Age:* ${profile.age} years\n*Location:* ${profile.city}, ${profile.state}\n\n*Education:* ${profile.education}\n*Profession:* ${profile.profession}\n${profile.annualIncome ? `*Income:* ${profile.annualIncome}` : ''}\n\n*Caste:* ${profile.caste}\n${profile.gotra ? `*Gotra:* ${profile.gotra}` : ''}\n\n${profile.horoscope?.rashi ? `*Rashi:* ${profile.horoscope.rashi}` : ''}\n${profile.horoscope?.manglikStatus ? `*Manglik:* ${profile.horoscope.manglikStatus}` : ''}\n\n📱 *Contact:*\n${profile.phone}\n\n👉 *View Full Profile:*\n${profileUrl}\n\n━━━━━━━━━━━━━━━\n_Pehchan - Trusted Connections_`
    },
    group: {
        label: isHindi ? 'ग्रुप पोस्ट' : 'Group Post',
        text: isHindi
            ? `┌─────────────────┐\n│ 💍 *शादी हेतु रिश्ता* 💍 │\n└─────────────────┘\n\n🙏 *${profile.fullName}*\n\n📅 *आयु:* ${profile.age} वर्ष\n🏠 *शहर:* ${profile.city}\n🎓 *शिक्षा:* ${profile.education}\n💼 *पेशा:* ${profile.profession}\n🛕 *जाति:* ${profile.caste}\n\n📞 *संपर्क:* ${profile.phone}\n\n🔗 *ऑनलाइन प्रोफ़ाइल:*\n${profileUrl}\n\n➖➖➖➖➖➖➖➖➖\n✅ _विश्वसनीय प्रोफ़ाइल_\n📲 _Pehchan App पर जुड़ें_`
            : `┌─────────────────┐\n│ 💍 *Matrimonial* 💍 │\n└─────────────────┘\n\n🙏 *${profile.fullName}*\n\n📅 *Age:* ${profile.age} years\n🏠 *City:* ${profile.city}\n🎓 *Education:* ${profile.education}\n💼 *Profession:* ${profile.profession}\n🛕 *Caste:* ${profile.caste}\n\n📞 *Contact:* ${profile.phone}\n\n🔗 *Online Profile:*\n${profileUrl}\n\n➖➖➖➖➖➖➖➖➖\n✅ _Verified Profile_\n📲 _Join us on Pehchan App_`
    }
});

function WhatsAppShare({ profile, visible, onClose }) {
    const { isHindi } = useLanguage();
    const [templateType, setTemplateType] = useState('detailed');

    const profileUrl = `${window.location.origin}/profiles/${profile?._id}`;
    const templates = profile ? getTemplates(profile, profileUrl, isHindi) : {};

    const [customText, setCustomText] = useState('');

    const currentText = customText || templates[templateType]?.text || '';

    const handleShare = () => {
        const encodedText = encodeURIComponent(currentText);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(currentText);
        message.success(isHindi ? 'कॉपी हो गया!' : 'Copied to clipboard!');
    };

    if (!profile) return null;

    return (
        <Modal
            title={
                <Space>
                    <WhatsAppOutlined style={{ color: '#25D366' }} />
                    {isHindi ? 'WhatsApp पर शेयर करें' : 'Share on WhatsApp'}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={600}
            footer={[
                <Button key="copy" icon={<CopyOutlined />} onClick={handleCopy}>
                    {isHindi ? 'कॉपी करें' : 'Copy Text'}
                </Button>,
                <Button
                    key="share"
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleShare}
                    style={{ background: '#25D366', borderColor: '#25D366' }}
                >
                    {isHindi ? 'WhatsApp खोलें' : 'Open WhatsApp'}
                </Button>
            ]}
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {/* Template Selection */}
                <div>
                    <Text strong>{isHindi ? 'टेम्पलेट चुनें:' : 'Choose Template:'}</Text>
                    <Radio.Group
                        value={templateType}
                        onChange={(e) => {
                            setTemplateType(e.target.value);
                            setCustomText('');
                        }}
                        style={{ marginLeft: 12 }}
                    >
                        {Object.entries(templates).map(([key, tmpl]) => (
                            <Radio.Button key={key} value={key}>{tmpl.label}</Radio.Button>
                        ))}
                    </Radio.Group>
                </div>

                {/* Preview/Edit */}
                <div>
                    <Text strong>{isHindi ? 'संदेश (संपादित करें):' : 'Message (edit if needed):'}</Text>
                    <TextArea
                        value={currentText}
                        onChange={(e) => setCustomText(e.target.value)}
                        rows={12}
                        style={{
                            marginTop: 8,
                            fontFamily: 'monospace',
                            background: '#f5f5f5'
                        }}
                    />
                </div>

                <div style={{
                    padding: 12,
                    background: '#E8F5E9',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <WhatsAppOutlined style={{ color: '#25D366', fontSize: 20 }} />
                    <Text style={{ fontSize: 12 }}>
                        {isHindi
                            ? 'WhatsApp खोलने पर यह संदेश स्वतः पेस्ट हो जाएगा'
                            : 'This message will be pre-filled when WhatsApp opens'}
                    </Text>
                </div>
            </Space>
        </Modal>
    );
}

export default WhatsAppShare;
