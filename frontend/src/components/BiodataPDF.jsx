/**
 * BiodataPDF - Component for generating PDF biodata with selectable fields
 */

import React, { useState, useRef } from 'react';
import { Modal, Button, Checkbox, Row, Col, Typography, Divider, Space, message, Select } from 'antd';
import { FilePdfOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';

const { Title, Text, Paragraph } = Typography;

// Religious invocation headers for different traditions with graphics, colors, and patterns
const RELIGIOUS_HEADERS = [
    {
        key: 'ganesh',
        label: '॥ श्री गणेशाय नमः ॥',
        labelEn: 'Shree Ganeshay Namah (Hindu)',
        icon: '🙏🕉️',
        primaryColor: '#FF6B00', // Saffron/Orange
        secondaryColor: '#FFF3E0',
        accentColor: '#E65100',
        bgPattern: '🕉️',
        cornerDecor: '॥'
    },
    {
        key: 'buddha',
        label: '॥ नमो बुद्धाय ॥',
        labelEn: 'Namo Buddhay (Buddhist)',
        icon: '☸️🙏',
        primaryColor: '#FFD700', // Gold
        secondaryColor: '#FFFDE7',
        accentColor: '#F9A825',
        bgPattern: '☸️',
        cornerDecor: '✿'
    },
    {
        key: 'jain',
        label: '॥ णमोकार मंत्र ॥',
        labelEn: 'Namokar Mantra (Jain)',
        icon: '🙏☯️',
        primaryColor: '#FFFFFF', // White
        secondaryColor: '#F5F5F5',
        accentColor: '#9E9E9E',
        bgPattern: '卍',
        cornerDecor: '◇'
    },
    {
        key: 'sikh',
        label: 'ੴ ਸਤਿ ਨਾਮੁ',
        labelEn: 'Ik Onkar Satnam (Sikh)',
        icon: '🙏☬',
        primaryColor: '#FF6F00', // Saffron
        secondaryColor: '#FFF8E1',
        accentColor: '#1565C0', // Blue
        bgPattern: '☬',
        cornerDecor: 'ੴ'
    },
    {
        key: 'christian',
        label: '✝ In the name of God',
        labelEn: 'Christian',
        icon: '✝️🙏',
        primaryColor: '#7B1FA2', // Purple (royalty)
        secondaryColor: '#F3E5F5',
        accentColor: '#4A148C',
        bgPattern: '✝',
        cornerDecor: '†'
    },
    {
        key: 'muslim',
        label: 'بِسْمِ اللَّهِ',
        labelEn: 'Bismillah (Muslim)',
        icon: '☪️🙏',
        primaryColor: '#2E7D32', // Green
        secondaryColor: '#E8F5E9',
        accentColor: '#1B5E20',
        bgPattern: '☪',
        cornerDecor: '✦'
    },
    {
        key: 'shiva',
        label: '॥ ॐ नमः शिवाय ॥',
        labelEn: 'Om Namah Shivay (Hindu)',
        icon: '🙏🔱',
        primaryColor: '#1565C0', // Blue (Shiva)
        secondaryColor: '#E3F2FD',
        accentColor: '#0D47A1',
        bgPattern: '🔱',
        cornerDecor: 'ॐ'
    },
    {
        key: 'durga',
        label: '॥ जय माता दी ॥',
        labelEn: 'Jai Mata Di (Hindu)',
        icon: '🙏🪷',
        primaryColor: '#C62828', // Red (Shakti)
        secondaryColor: '#FFEBEE',
        accentColor: '#B71C1C',
        bgPattern: '🪷',
        cornerDecor: '॥'
    },
    {
        key: 'none',
        label: '',
        labelEn: 'No Header',
        icon: '',
        primaryColor: '#A0153E', // Default Pehchan color
        secondaryColor: '#FFF8F0',
        accentColor: '#7A0F2E',
        bgPattern: '',
        cornerDecor: ''
    },
];

// Field groups with labels
const FIELD_GROUPS = {
    personal: {
        label: 'Personal Information',
        labelHi: 'व्यक्तिगत जानकारी',
        fields: [
            { key: 'fullName', label: 'Full Name', labelHi: 'पूरा नाम' },
            { key: 'dateOfBirth', label: 'Date of Birth', labelHi: 'जन्म तिथि' },
            { key: 'age', label: 'Age', labelHi: 'आयु' },
            { key: 'gender', label: 'Gender', labelHi: 'लिंग' },
            { key: 'heightCm', label: 'Height', labelHi: 'ऊंचाई' },
            { key: 'weightKg', label: 'Weight', labelHi: 'वजन' },
            { key: 'complexion', label: 'Complexion', labelHi: 'रंग' },
            { key: 'maritalStatus', label: 'Marital Status', labelHi: 'वैवाहिक स्थिति' },
        ]
    },
    religious: {
        label: 'Religious Background',
        labelHi: 'धार्मिक पृष्ठभूमि',
        fields: [
            { key: 'religion', label: 'Religion', labelHi: 'धर्म' },
            { key: 'caste', label: 'Caste', labelHi: 'जाति' },
            { key: 'subCaste', label: 'Sub-Caste', labelHi: 'उप-जाति' },
            { key: 'gotra', label: 'Gotra', labelHi: 'गोत्र' },
        ]
    },
    education: {
        label: 'Education & Career',
        labelHi: 'शिक्षा और करियर',
        fields: [
            { key: 'education', label: 'Education', labelHi: 'शिक्षा' },
            { key: 'profession', label: 'Profession', labelHi: 'पेशा' },
            { key: 'company', label: 'Company', labelHi: 'कंपनी' },
            { key: 'annualIncome', label: 'Annual Income', labelHi: 'वार्षिक आय' },
        ]
    },
    family: {
        label: 'Family Details',
        labelHi: 'पारिवारिक विवरण',
        fields: [
            { key: 'fatherName', label: "Father's Name", labelHi: 'पिता का नाम' },
            { key: 'fatherOccupation', label: "Father's Occupation", labelHi: 'पिता का पेशा' },
            { key: 'motherName', label: "Mother's Name", labelHi: 'माता का नाम' },
            { key: 'brothersCount', label: 'Brothers', labelHi: 'भाई' },
            { key: 'sistersCount', label: 'Sisters', labelHi: 'बहन' },
            { key: 'familyType', label: 'Family Type', labelHi: 'परिवार का प्रकार' },
        ]
    },
    location: {
        label: 'Location',
        labelHi: 'स्थान',
        fields: [
            { key: 'city', label: 'City', labelHi: 'शहर' },
            { key: 'state', label: 'State', labelHi: 'राज्य' },
            { key: 'country', label: 'Country', labelHi: 'देश' },
            { key: 'nativePlace', label: 'Native Place', labelHi: 'मूल स्थान' },
        ]
    },
    horoscope: {
        label: 'Horoscope',
        labelHi: 'कुंडली',
        fields: [
            { key: 'horoscope.rashi', label: 'Rashi', labelHi: 'राशि' },
            { key: 'horoscope.nakshatra', label: 'Nakshatra', labelHi: 'नक्षत्र' },
            { key: 'horoscope.manglikStatus', label: 'Manglik', labelHi: 'मांगलिक' },
            { key: 'horoscope.birthTime', label: 'Birth Time', labelHi: 'जन्म समय' },
            { key: 'horoscope.birthPlace', label: 'Birth Place', labelHi: 'जन्म स्थान' },
        ]
    },
    contact: {
        label: 'Contact Details',
        labelHi: 'संपर्क विवरण',
        fields: [
            { key: 'phone', label: 'Phone', labelHi: 'फोन' },
            { key: 'alternatePhone', label: 'Alternate Phone', labelHi: 'वैकल्पिक फोन' },
            { key: 'email', label: 'Email', labelHi: 'ईमेल' },
        ]
    },
    about: {
        label: 'About',
        labelHi: 'परिचय',
        fields: [
            { key: 'aboutMe', label: 'About Me', labelHi: 'मेरे बारे में' },
        ]
    }
};

// Get nested value from object
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, p) => o?.[p], obj);
};

// Format value for display
const formatValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (key === 'heightCm') return `${value} cm`;
    if (key === 'weightKg') return `${value} kg`;
    if (key === 'dateOfBirth') return new Date(value).toLocaleDateString('en-IN');
    if (typeof value === 'string') return value.replace(/_/g, ' ');
    return value;
};

function BiodataPDF({ profile, visible, onClose }) {
    const { isHindi } = useLanguage();
    const printRef = useRef(null);

    // Default selected fields
    const [selectedFields, setSelectedFields] = useState(() => {
        const defaults = {};
        Object.keys(FIELD_GROUPS).forEach(group => {
            FIELD_GROUPS[group].fields.forEach(f => {
                // Default: select all except contact for privacy
                defaults[f.key] = group !== 'contact';
            });
        });
        return defaults;
    });

    const [includePhoto, setIncludePhoto] = useState(true);
    const [headerType, setHeaderType] = useState('ganesh'); // Default to Ganesh

    const handleFieldToggle = (key) => {
        setSelectedFields(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleGroupToggle = (group, checked) => {
        const newSelected = { ...selectedFields };
        FIELD_GROUPS[group].fields.forEach(f => {
            newSelected[f.key] = checked;
        });
        setSelectedFields(newSelected);
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const printWindow = window.open('', '', 'width=800,height=600');

        printWindow.document.write(`
            <html>
            <head>
                <title>Biodata - ${profile.fullName}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        padding: 20px; 
                        color: #2C1810;
                    }
                    .biodata-header { 
                        text-align: center; 
                        margin-bottom: 20px; 
                        padding-bottom: 15px;
                        border-bottom: 2px solid #A0153E;
                    }
                    .biodata-header h1 { 
                        color: #A0153E; 
                        font-size: 24px;
                        margin-bottom: 5px;
                    }
                    .biodata-header .tagline {
                        color: #8B7355;
                        font-size: 12px;
                    }
                    .profile-photo {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .profile-photo img {
                        width: 150px;
                        height: 180px;
                        object-fit: cover;
                        border-radius: 8px;
                        border: 2px solid #D4AF37;
                    }
                    .profile-name {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .profile-name h2 {
                        font-size: 20px;
                        color: #2C1810;
                    }
                    .section { 
                        margin-bottom: 15px; 
                    }
                    .section-title { 
                        background: linear-gradient(135deg, #A0153E, #7A0F2E);
                        color: white; 
                        padding: 6px 12px; 
                        font-size: 12px;
                        font-weight: 600;
                        margin-bottom: 8px;
                    }
                    .field-row { 
                        display: flex; 
                        padding: 4px 0;
                        border-bottom: 1px dotted #E5D4C0;
                    }
                    .field-label { 
                        width: 40%; 
                        font-weight: 500;
                        color: #8B7355;
                        font-size: 12px;
                    }
                    .field-value { 
                        width: 60%; 
                        font-size: 12px;
                    }
                    .about-section {
                        background: #FFF8F0;
                        padding: 10px;
                        border-radius: 4px;
                        font-size: 12px;
                        line-height: 1.5;
                    }
                    .footer {
                        margin-top: 20px;
                        text-align: center;
                        color: #8B7355;
                        font-size: 10px;
                    }
                    @media print {
                        body { padding: 10px; }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);

        message.success(isHindi ? 'PDF तैयार है!' : 'PDF ready!');
    };

    const primaryPhoto = profile.photos?.find(p => p.isPrimary)?.url || profile.photos?.[0]?.url;

    return (
        <Modal
            title={
                <Space>
                    <FilePdfOutlined style={{ color: '#A0153E' }} />
                    {isHindi ? 'बायोडाटा PDF बनाएं' : 'Generate Biodata PDF'}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                </Button>,
                <Button
                    key="print"
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                    style={{ background: 'linear-gradient(135deg, #A0153E, #7A0F2E)' }}
                >
                    {isHindi ? 'PDF डाउनलोड / प्रिंट करें' : 'Download / Print PDF'}
                </Button>
            ]}
        >
            <Row gutter={24}>
                {/* Field Selection */}
                <Col xs={24} md={10}>
                    <Title level={5}>{isHindi ? 'फ़ील्ड चुनें' : 'Select Fields to Include'}</Title>
                    <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                        <Checkbox
                            checked={includePhoto}
                            onChange={(e) => setIncludePhoto(e.target.checked)}
                            style={{ marginBottom: 12 }}
                        >
                            <Text strong>{isHindi ? 'फोटो शामिल करें' : 'Include Photo'}</Text>
                        </Checkbox>

                        <div style={{ marginBottom: 16 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                {isHindi ? 'धार्मिक शीर्षक' : 'Religious Header'}
                            </Text>
                            <Select
                                value={headerType}
                                onChange={setHeaderType}
                                style={{ width: '100%' }}
                                options={RELIGIOUS_HEADERS.map(h => ({
                                    value: h.key,
                                    label: (
                                        <span>
                                            {h.label || '(No Header)'}
                                            <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                                                {h.labelEn}
                                            </Text>
                                        </span>
                                    )
                                }))}
                            />
                        </div>

                        {Object.entries(FIELD_GROUPS).map(([groupKey, group]) => {
                            const allChecked = group.fields.every(f => selectedFields[f.key]);
                            const someChecked = group.fields.some(f => selectedFields[f.key]);

                            return (
                                <div key={groupKey} style={{ marginBottom: 12 }}>
                                    <Checkbox
                                        indeterminate={someChecked && !allChecked}
                                        checked={allChecked}
                                        onChange={(e) => handleGroupToggle(groupKey, e.target.checked)}
                                    >
                                        <Text strong>{isHindi ? group.labelHi : group.label}</Text>
                                    </Checkbox>
                                    <div style={{ paddingLeft: 24 }}>
                                        {group.fields.map(field => (
                                            <div key={field.key}>
                                                <Checkbox
                                                    checked={selectedFields[field.key]}
                                                    onChange={() => handleFieldToggle(field.key)}
                                                    style={{ fontSize: 12 }}
                                                >
                                                    {isHindi ? field.labelHi : field.label}
                                                </Checkbox>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Col>

                {/* Preview */}
                <Col xs={24} md={14}>
                    <Title level={5}>{isHindi ? 'पूर्वावलोकन' : 'Preview'}</Title>
                    {(() => {
                        const selectedHeader = RELIGIOUS_HEADERS.find(h => h.key === headerType) || RELIGIOUS_HEADERS[RELIGIOUS_HEADERS.length - 1];
                        return (
                            <div
                                ref={printRef}
                                style={{
                                    border: `2px solid ${selectedHeader.primaryColor}`,
                                    borderRadius: 8,
                                    padding: 16,
                                    background: selectedHeader.secondaryColor,
                                    maxHeight: 400,
                                    overflowY: 'auto',
                                    fontSize: 12,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Corner Decorations */}
                                {selectedHeader.cornerDecor && (
                                    <>
                                        <div style={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 12,
                                            fontSize: 16,
                                            color: selectedHeader.primaryColor,
                                            opacity: 0.6
                                        }}>
                                            {selectedHeader.cornerDecor}
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 12,
                                            fontSize: 16,
                                            color: selectedHeader.primaryColor,
                                            opacity: 0.6
                                        }}>
                                            {selectedHeader.cornerDecor}
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 8,
                                            left: 12,
                                            fontSize: 16,
                                            color: selectedHeader.primaryColor,
                                            opacity: 0.6
                                        }}>
                                            {selectedHeader.cornerDecor}
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 8,
                                            right: 12,
                                            fontSize: 16,
                                            color: selectedHeader.primaryColor,
                                            opacity: 0.6
                                        }}>
                                            {selectedHeader.cornerDecor}
                                        </div>
                                    </>
                                )}

                                {/* Subtle Background Pattern */}
                                {selectedHeader.bgPattern && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: 120,
                                        opacity: 0.04,
                                        pointerEvents: 'none',
                                        zIndex: 0
                                    }}>
                                        {selectedHeader.bgPattern}
                                    </div>
                                )}

                                {/* Header with Photo on Right */}
                                <div className="header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position: 'relative', zIndex: 1 }}>
                                    {/* Left: Religious Header + Name */}
                                    <div style={{ flex: 1 }}>
                                        {headerType !== 'none' && (
                                            <div className="biodata-header" style={{ textAlign: 'left', borderBottom: 'none', paddingBottom: 8, marginBottom: 8 }}>
                                                <div style={{ fontSize: 24, marginBottom: 4 }}>
                                                    {selectedHeader.icon}
                                                </div>
                                                <h1 style={{ fontSize: 18, marginBottom: 4, color: selectedHeader.primaryColor }}>
                                                    {selectedHeader.label}
                                                </h1>
                                            </div>
                                        )}
                                        <div className="profile-name" style={{ textAlign: 'left', marginBottom: 8 }}>
                                            <h2 style={{ fontSize: 20, color: '#2C1810', margin: 0 }}>{profile.fullName}</h2>
                                            <div style={{ color: '#8B7355', fontSize: 12, marginTop: 4 }}>
                                                {profile.age} {isHindi ? 'वर्ष' : 'yrs'} • {profile.city}, {profile.state}
                                            </div>
                                        </div>
                                        <div className="tagline" style={{ fontSize: 14, color: selectedHeader.primaryColor, fontWeight: 600, letterSpacing: 2 }}>
                                            {isHindi ? 'बायोडाटा' : 'BIODATA'}
                                        </div>
                                    </div>


                                    {/* QR Code */}
                                    {/* QR Code */}
                                    <div style={{ marginLeft: 16, textAlign: 'center' }}>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/public/' + (profile.customId || profile._id))}`}
                                            alt="Profile QR"
                                            style={{ width: 100, height: 100, border: '1px solid #ddd', padding: 4 }}
                                        />
                                        <div style={{ fontSize: 9, marginTop: 4 }}>Scan to View</div>
                                    </div>

                                    {/* Right: Photo */}
                                    {includePhoto && primaryPhoto && (
                                        <div className="profile-photo" style={{ marginLeft: 16 }}>
                                            <img
                                                src={primaryPhoto}
                                                alt={profile.fullName}
                                                style={{
                                                    width: 100,
                                                    height: 120,
                                                    objectFit: 'cover',
                                                    borderRadius: 6,
                                                    border: `2px solid ${selectedHeader.primaryColor}`
                                                }}
                                            />
                                            {/* Profile ID Badge */}
                                            {profile.customId && (
                                                <div style={{
                                                    marginTop: 4,
                                                    fontSize: 10,
                                                    fontWeight: 'bold',
                                                    color: '#2C1810',
                                                    background: '#FFF8F0',
                                                    padding: '2px 4px',
                                                    borderRadius: 4,
                                                    border: '1px dashed #A0153E'
                                                }}>
                                                    ID: {profile.customId}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div style={{ borderTop: `2px solid ${selectedHeader.primaryColor}`, marginBottom: 12, position: 'relative', zIndex: 1 }}></div>

                                {/* Sections */}
                                {Object.entries(FIELD_GROUPS).map(([groupKey, group]) => {
                                    const selectedInGroup = group.fields.filter(f => selectedFields[f.key]);
                                    if (selectedInGroup.length === 0) return null;

                                    // Special case for About section
                                    if (groupKey === 'about') {
                                        const aboutValue = getNestedValue(profile, 'aboutMe');
                                        if (!aboutValue) return null;

                                        return (
                                            <div className="section" key={groupKey}>
                                                <div className="section-title">
                                                    {isHindi ? group.labelHi : group.label}
                                                </div>
                                                <div className="about-section">
                                                    {aboutValue}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="section" key={groupKey}>
                                            <div className="section-title">
                                                {isHindi ? group.labelHi : group.label}
                                            </div>
                                            {selectedInGroup.map(field => {
                                                const value = getNestedValue(profile, field.key);
                                                return (
                                                    <div className="field-row" key={field.key}>
                                                        <div className="field-label">
                                                            {isHindi ? field.labelHi : field.label}
                                                        </div>
                                                        <div className="field-value">
                                                            {formatValue(field.key, value)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}

                                {/* Footer with QR */}
                                <div className="footer" style={{ marginTop: 32, textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 8 }}>
                                    <div style={{ color: '#8B7355', fontSize: 10 }}>
                                        Generated via Pehchan • {new Date().toLocaleDateString()} • www.pehchan.app
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </Col>
            </Row>
        </Modal>
    );
}

export default BiodataPDF;
