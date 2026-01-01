/**
 * BiodataPDF - Component for generating PDF biodata with selectable fields
 */

import React, { useState, useRef } from 'react';
import { Modal, Button, Checkbox, Row, Col, Typography, Divider, Space, message, Select, Collapse } from 'antd';
const { Panel } = Collapse;
import { FilePdfOutlined, PrinterOutlined, DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';
import { useConfig } from '../context/ConfigContext';

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



function BiodataPDF({ profile, visible, onClose }) {
    const { isHindi } = useLanguage();
    const { config } = useConfig();
    // Template State
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [pdfLanguage, setPdfLanguage] = useState(isHindi ? 'hi' : 'en');

    // Ensure default language follows app context but can be overridden
    const isPdfHindi = pdfLanguage === 'hi';

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

    const [selectedPhotoUrls, setSelectedPhotoUrls] = useState(() => {
        const primary = profile.photos?.find(p => p.isPrimary)?.url || profile.photos?.[0]?.url;
        return primary ? [primary] : [];
    });

    // Toggle photo selection
    const handlePhotoToggle = (url) => {
        setSelectedPhotoUrls(prev => {
            if (prev.includes(url)) {
                return prev.filter(p => p !== url);
            } else {
                return [...prev, url];
            }
        });
    };

    // Default to Ganesh or first available
    const [headerType, setHeaderType] = useState('ganesh');

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

    // Format value for display with localization
    const formatValue = (key, value) => {
        if (value === null || value === undefined || value === '') return '-';
        if (key === 'heightCm') return `${value} cm`;
        if (key === 'weightKg') return `${value} kg`;

        // Special formatting for dates
        if (key === 'dateOfBirth') {
            try {
                return new Date(value).toLocaleDateString(isPdfHindi ? 'hi-IN' : 'en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            } catch (e) {
                return value;
            }
        }

        // Mapping strategy based on key
        const optionMap = {
            education: 'educationOptions',
            profession: 'professionOptions',
            maritalStatus: 'maritalStatusOptions',
            religion: 'religionOptions',
            state: 'stateOptions',
            complexion: 'complexionOptions',
            familyType: 'familyTypeOptions',
            'horoscope.rashi': 'rashiOptions',
            'horoscope.nakshatra': 'nakshatraOptions',
            'horoscope.manglikStatus': 'manglikOptions'
        };

        const configKey = optionMap[key];
        if (configKey && config?.[configKey]) {
            const option = config[configKey].find(opt =>
                (typeof opt === 'string' ? opt : opt.value) === value
            );
            if (option) {
                return isPdfHindi ? (option.labelHi || option.labelEn) : option.labelEn;
            }
        }

        // Fallback: Humanize snake_case
        if (typeof value === 'string') {
            return value
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }

        return value;
    };

    const TEMPLATES = [
        { key: 'classic', label: 'Classic Simple', labelHi: 'क्लासिक सरल', color: '#A0153E' },
        { key: 'modern', label: 'Modern Split', labelHi: 'आधुनिक स्प्लिट', color: '#006CA5' },
        { key: 'royal', label: 'Royal Vintage', labelHi: 'रॉयल विंटेज', color: '#B8860B' },
        { key: 'floral', label: 'Floral Elegant', labelHi: 'फ्लोरल एलिगेंट', color: '#D44D5C' },
        { key: 'professional', label: 'Compact Prof', labelHi: 'कॉम्पैक्ट प्रो', color: '#2C3E50' }
    ];

    const getTemplateStyles = (template, primaryColor, isPreview = false) => {
        const selector = isPreview ? '.preview-container' : 'body';
        const baseStyles = `
            ${selector} { 
                margin: 0; 
                padding: ${isPreview ? '0' : '20px'}; 
                box-sizing: border-box; 
                font-family: 'Outfit', 'Inter', sans-serif;
                color: #2C1810;
                -webkit-print-color-adjust: exact;
            }
            ${selector} * { box-sizing: border-box; }
            ${selector} img { max-width: 100%; }
        `;

        if (template === 'modern') {
            return `
                ${baseStyles}
                ${selector} .container { display: flex; height: 100%; border: 4px solid ${primaryColor}; min-height: ${isPreview ? 'auto' : '1100px'}; }
                ${selector} .sidebar { 
                    width: 35%; 
                    background: ${primaryColor}; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    display: flex;
                    flex-direction: column;
                }
                ${selector} .main-content { width: 65%; padding: 25px; background: white; }
                ${selector} .sidebar h1, ${selector} .sidebar h2, ${selector} .sidebar h3 { color: white; margin: 0; }
                ${selector} .sidebar .field-row { border-bottom: 1px solid rgba(255,255,255,0.2); }
                ${selector} .sidebar .field-label { color: rgba(255,255,255,0.8); }
                ${selector} .profile-photo-sidebar img { border: 4px solid white; border-radius: 50%; width: 140px; height: 140px; object-fit: cover; margin: 0 auto; }
                ${selector} .section-title { 
                    color: ${primaryColor}; 
                    border-bottom: 2px solid ${primaryColor}; 
                    padding-bottom: 5px; 
                    margin: 20px 0 10px; 
                    font-size: 14px; 
                    text-transform: uppercase; 
                    font-weight: 700;
                    letter-spacing: 1px;
                }
                ${selector} .field-row { display: flex; margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 4px; }
                ${selector} .field-label { width: 40%; font-weight: 600; color: #555; font-size: 12px; }
                ${selector} .field-value { width: 60%; font-size: 12px; font-weight: 500; }
                ${selector} .header-icon { font-size: 24px; margin-bottom: 10px; display: block; }
            `;
        }

        if (template === 'royal') {
            return `
                ${baseStyles}
                ${selector} { background: #FFFBF0; border: 8px double ${primaryColor}; padding: ${isPreview ? '20px' : '40px'}; min-height: ${isPreview ? 'auto' : '1100px'}; }
                ${selector} .biodata-header { text-align: center; margin-bottom: 25px; }
                ${selector} .biodata-header h1 { font-family: serif; color: ${primaryColor}; font-size: 24px; margin-bottom: 5px; }
                ${selector} .section-title { 
                    text-align: center; 
                    color: ${primaryColor}; 
                    font-family: serif; 
                    font-size: 16px; 
                    margin: 15px 0 10px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                }
                ${selector} .section-title::before, ${selector} .section-title::after { 
                    content: '❧'; 
                    color: ${primaryColor}; 
                    margin: 0 10px; 
                    font-size: 18px; 
                }
                ${selector} .field-row { display: flex; justify-content: space-between; margin-bottom: 6px; padding: 0 20px; border-bottom: 1px solid rgba(0,0,0,0.05); }
                ${selector} .field-label { color: #555; font-style: italic; font-weight: 600; text-align: left; font-size: 12px; }
                ${selector} .field-value { text-align: right; font-weight: 600; color: #000; font-size: 12px; }
                ${selector} .profile-photo { text-align: center; margin-bottom: 15px; }
                ${selector} .profile-photo img { border: 2px solid ${primaryColor}; padding: 3px; width: 120px; height: 150px; object-fit: cover; }
            `;
        }

        if (template === 'floral') {
            return `
                ${baseStyles}
                ${selector} { 
                    background: #FFF9F9; 
                    border: 15px solid transparent;
                    border-image: radial-gradient(#F8BBD0 20%, transparent 20%) 0 0 100% 100% / 15px;
                    padding: ${isPreview ? '20px' : '40px'}; 
                    min-height: ${isPreview ? 'auto' : '1100px'}; 
                    position: relative;
                }
                ${selector}::before {
                    content: '🌸'; position: absolute; top: 10px; left: 10px; font-size: 24px; opacity: 0.6;
                }
                ${selector}::after {
                    content: '🌸'; position: absolute; bottom: 10px; right: 10px; font-size: 24px; opacity: 0.6;
                }
                ${selector} .biodata-header { text-align: center; margin-bottom: 30px; }
                ${selector} .biodata-header h1 { font-family: 'serif'; color: #D44D5C; font-size: 26px; border-bottom: 1px solid #F8BBD0; display: inline-block; padding-bottom: 5px; }
                ${selector} .section-title { 
                    color: #D44D5C; 
                    font-size: 15px; 
                    margin: 20px 0 10px; 
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                }
                ${selector} .section-title::after {
                    content: ''; flex: 1; height: 1px; background: linear-gradient(to right, #F8BBD0, transparent); margin-left: 10px;
                }
                ${selector} .field-row { display: flex; margin-bottom: 6px; padding: 4px 0; }
                ${selector} .field-label { width: 35%; color: #880E4F; font-weight: 600; font-size: 12px; }
                ${selector} .field-value { width: 65%; color: #2C1810; font-size: 12px; }
                ${selector} .profile-photo-floral { text-align: center; margin-bottom: 20px; }
                ${selector} .profile-photo-floral img { border-radius: 50% 50% 0 0; border: 4px solid #F8BBD0; width: 140px; height: 160px; object-fit: cover; }
            `;
        }

        if (template === 'professional') {
            return `
                ${baseStyles}
                ${selector} { 
                    padding: ${isPreview ? '20px' : '40px'}; 
                    min-height: ${isPreview ? 'auto' : '1100px'}; 
                    background: white;
                }
                ${selector} .biodata-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; border-bottom: 3px solid #2C3E50; padding-bottom: 15px; }
                ${selector} .header-left h1 { color: #2C3E50; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
                ${selector} .section-title { 
                    background: #f4f4f4; 
                    color: #2C3E50; 
                    padding: 6px 12px; 
                    font-size: 13px; 
                    margin: 15px 0 10px; 
                    font-weight: 800; 
                    border-left: 4px solid #2C3E50;
                    text-transform: uppercase;
                }
                ${selector} .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; }
                ${selector} .field-row { display: flex; border-bottom: 1px solid #f0f0f0; padding: 3px 0; }
                ${selector} .field-label { width: 45%; color: #7f8c8d; font-weight: 600; font-size: 11px; text-transform: uppercase; }
                ${selector} .field-value { width: 55%; color: #2c3e50; font-size: 12px; font-weight: 600; }
                ${selector} .profile-photo-prof { float: right; }
                ${selector} .profile-photo-prof img { width: 100px; height: 120px; object-fit: cover; border: 1px solid #2C3E50; }
                ${selector} .clearfix::after { content: ""; clear: both; display: table; }
            `;
        }

        // Classic (Default)
        return `
            ${baseStyles}
            ${selector} .biodata-header { text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${primaryColor}; }
            ${selector} .biodata-header h1 { color: ${primaryColor}; font-size: 22px; margin: 0; }
            ${selector} .section-title { background: ${primaryColor}; color: white; padding: 4px 10px; font-size: 13px; margin: 15px 0 8px; font-weight: bold; border-radius: 4px; }
            ${selector} .field-row { display: flex; padding: 5px 0; border-bottom: 1px solid #eee; }
            ${selector} .field-label { width: 40%; font-weight: 600; color: #444; font-size: 12px; }
            ${selector} .field-value { width: 60%; font-size: 12px; }
            ${selector} .profile-photo-classic { float: right; margin-left: 15px; margin-bottom: 10px; }
            ${selector} .profile-photo-classic img { width: 120px; height: 150px; object-fit: cover; border: 1px solid #ccc; border-radius: 4px; }
            ${selector} .clearfix::after { content: ""; clear: both; display: table; }
        `;
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const selectedHeader = RELIGIOUS_HEADERS.find(h => h.key === headerType) || RELIGIOUS_HEADERS[RELIGIOUS_HEADERS.length - 1];
        // Use template-specific primary color or header color
        const themeColor = selectedTemplate === 'royal' ? '#B8860B' : selectedTemplate === 'modern' ? '#006CA5' : selectedHeader.primaryColor;

        const printWindow = window.open('', '', 'width=900,height=1200');

        printWindow.document.write(`
            <html>
            <head>
                <title>Biodata - ${profile.fullName}</title>
                <style>
                    ${getTemplateStyles(selectedTemplate, themeColor)}
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
        }, 500);

        message.success(isPdfHindi ? 'PDF तैयार है!' : 'PDF ready!');
    };

    // Helper to render sections consistently
    const renderSection = (groupKey, group, isSidebar = false) => {
        const selectedInGroup = group.fields.filter(f => selectedFields[f.key]);
        if (selectedInGroup.length === 0) return null;

        // Custom About Section
        if (groupKey === 'about') {
            const aboutValue = getNestedValue(profile, 'aboutMe');
            if (!aboutValue) return null;
            return (
                <div className="section" key={groupKey}>
                    <div className="section-title">{isPdfHindi ? group.labelHi : group.label}</div>
                    <div style={{ padding: '0 5px' }}>{aboutValue}</div>
                </div>
            );
        }

        return (
            <div className="section" key={groupKey}>
                <div className="section-title">{isPdfHindi ? group.labelHi : group.label}</div>
                {selectedInGroup.map(field => {
                    const value = getNestedValue(profile, field.key);
                    return (
                        <div className="field-row" key={field.key}>
                            <div className="field-label">{isPdfHindi ? field.labelHi : field.label}</div>
                            <div className="field-value">{formatValue(field.key, value)}</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const primaryPhoto = selectedPhotoUrls.length > 0 ? selectedPhotoUrls[0] : null;

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
            width={1200}
            bodyStyle={{ padding: '0px' }}
            style={{ top: 20 }}
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
            <Row gutter={0}>
                {/* SETTINGS SIDEBAR */}
                <Col xs={24} md={8} style={{
                    borderRight: '1px solid #f0f0f0',
                    padding: '24px',
                    height: '80vh',
                    overflowY: 'auto'
                }}>

                    {/* Language Selection */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={5}>{isHindi ? 'भाषा' : 'Biodata Language'}</Title>
                        <Select
                            value={pdfLanguage}
                            onChange={setPdfLanguage}
                            style={{ width: '100%' }}
                            options={[
                                { value: 'en', label: 'English' },
                                { value: 'hi', label: 'Hindi (हिंदी)' }
                            ]}
                        />
                    </div>

                    {/* Template Selection */}
                    <div style={{ marginBottom: 24 }}>
                        <Title level={5}>{isHindi ? 'डिज़ाइन चुनें' : 'Select Design'}</Title>
                        <Select
                            value={selectedTemplate}
                            onChange={setSelectedTemplate}
                            style={{ width: '100%' }}
                            dropdownStyle={{ borderRadius: 8 }}
                            options={TEMPLATES.map(t => ({
                                value: t.key,
                                label: (
                                    <Space>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.color }}></div>
                                        {isHindi ? t.labelHi : t.label}
                                    </Space>
                                )
                            }))}
                        />
                    </div>

                    <Divider />

                    {/* Field Selection */}
                    <Title level={5} style={{ marginTop: 16 }}>{isHindi ? 'फ़ील्ड चुनें' : 'Include Fields'}</Title>

                    <div style={{ marginBottom: 20 }}>
                        <Text strong style={{ display: 'block', marginBottom: 12 }}>{isHindi ? 'फोटो स्लाइडर' : 'Photo Selection'}</Text>
                        {profile.photos?.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {profile.photos.map((photo, index) => (
                                    <div
                                        key={photo.url}
                                        onClick={() => handlePhotoToggle(photo.url)}
                                        style={{
                                            position: 'relative',
                                            cursor: 'pointer',
                                            borderRadius: 6,
                                            overflow: 'hidden',
                                            border: `2px solid ${selectedPhotoUrls.includes(photo.url) ? '#A0153E' : '#eee'}`,
                                            padding: 2
                                        }}
                                    >
                                        <img
                                            src={photo.url}
                                            alt="thumb"
                                            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                                        />
                                        {selectedPhotoUrls.includes(photo.url) && (
                                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '0 4px', background: '#A0153E', color: 'white', fontSize: 10, borderBottomLeftRadius: 4 }}>
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : <Text type="secondary">No photos</Text>}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>{isHindi ? 'धार्मिक शीर्षक' : 'Religious Header'}</Text>
                        <Select
                            value={headerType}
                            onChange={setHeaderType}
                            style={{ width: '100%' }}
                            options={RELIGIOUS_HEADERS.map(h => ({ value: h.key, label: isPdfHindi ? h.label || h.labelEn : h.labelEn }))}
                        />
                    </div>

                    <Collapse ghost expandIconPosition="end">
                        {Object.entries(FIELD_GROUPS).map(([groupKey, group]) => {
                            const allChecked = group.fields.every(f => selectedFields[f.key]);
                            const someChecked = group.fields.some(f => selectedFields[f.key]);

                            return (
                                <Panel
                                    key={groupKey}
                                    header={
                                        <Checkbox
                                            indeterminate={someChecked && !allChecked}
                                            checked={allChecked}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleGroupToggle(groupKey, e.target.checked);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Text strong style={{ fontSize: 13 }}>{isHindi ? group.labelHi : group.label}</Text>
                                        </Checkbox>
                                    }
                                    style={{ background: '#f9f9f9', marginBottom: 8, borderRadius: 8, border: '1px solid #f0f0f0' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 24 }}>
                                        {group.fields.map(field => (
                                            <Checkbox
                                                key={field.key}
                                                checked={selectedFields[field.key]}
                                                onChange={() => handleFieldToggle(field.key)}
                                            >
                                                <span style={{ fontSize: 12 }}>{isHindi ? field.labelHi : field.label}</span>
                                            </Checkbox>
                                        ))}
                                    </div>
                                </Panel>
                            );
                        })}
                    </Collapse>
                </Col>

                {/* PREVIEW AREA */}
                <Col xs={24} md={16} style={{
                    background: '#f0f2f5',
                    padding: '40px 20px',
                    height: '80vh',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>

                    {/* Inject styles for preview */}
                    <style>
                        {getTemplateStyles(selectedTemplate, (selectedTemplate === 'royal' ? '#B8860B' : selectedTemplate === 'modern' ? '#006CA5' : (RELIGIOUS_HEADERS.find(h => h.key === headerType)?.primaryColor || '#A0153E')), true)}
                    </style>

                    <div style={{ marginBottom: 20, textAlign: 'center' }}>
                        <Text type="secondary">
                            <PrinterOutlined style={{ marginRight: 8 }} />
                            {isHindi ? 'लाइव प्रीव्यू - प्रिंट होने पर ऐसा दिखेगा' : 'Live Preview - This is how it will look when printed'}
                        </Text>
                    </div>

                    {/* Main Render Container that gets Printed */}
                    <div ref={printRef} className="preview-container" style={{
                        width: '100%',
                        maxWidth: 700,
                        background: 'white',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        marginBottom: 40
                    }}>

                        {/* 1. MODERN TEMPLATE RENDER */}
                        {selectedTemplate === 'modern' && (() => {
                            const selectedHeader = RELIGIOUS_HEADERS.find(h => h.key === headerType);
                            return (
                                <div className="container">
                                    <div className="sidebar">
                                        {primaryPhoto && (
                                            <div className="profile-photo-sidebar">
                                                <img src={primaryPhoto} alt="Profile" />
                                            </div>
                                        )}
                                        <h2 style={{ marginTop: 20, fontSize: 24, fontWeight: 700 }}>{profile.fullName}</h2>
                                        <div style={{ fontSize: 14, opacity: 0.9, marginTop: 5 }}>
                                            {profile.city}, {profile.state}
                                        </div>
                                        <div style={{ fontSize: 14, opacity: 0.9 }}>
                                            {profile.age} {isPdfHindi ? 'वर्ष' : 'Yrs'}
                                        </div>

                                        <div style={{ marginTop: 30, textAlign: 'left' }}>
                                            {renderSection('contact', FIELD_GROUPS.contact, true)}
                                        </div>

                                        {/* QR Code in Sidebar */}
                                        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/public/' + (profile.customId || profile._id))}`}
                                                alt="QR"
                                                style={{ width: 80, height: 80, border: '4px solid white' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="main-content">
                                        {headerType !== 'none' && (
                                            <div style={{ textAlign: 'center', marginBottom: 20, color: '#006CA5' }}>
                                                <span className="header-icon">{selectedHeader?.icon}</span>
                                                <h3>{selectedHeader?.label}</h3>
                                            </div>
                                        )}

                                        {renderSection('personal', FIELD_GROUPS.personal)}
                                        {renderSection('education', FIELD_GROUPS.education)}
                                        {renderSection('family', FIELD_GROUPS.family)}
                                        {renderSection('religious', FIELD_GROUPS.religious)}
                                        {renderSection('horoscope', FIELD_GROUPS.horoscope)}
                                        {renderSection('location', FIELD_GROUPS.location)}
                                        {renderSection('about', FIELD_GROUPS.about)}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 2. ROYAL TEMPLATE RENDER */}
                        {selectedTemplate === 'royal' && (() => {
                            const selectedHeader = RELIGIOUS_HEADERS.find(h => h.key === headerType);
                            return (
                                <div>
                                    {/* Ornamental Header */}
                                    <div className="biodata-header">
                                        <div style={{ fontSize: 40 }}>{selectedHeader?.icon}</div>
                                        <h1>{selectedHeader?.label}</h1>
                                        <div style={{ marginTop: 10, borderTop: '1px solid #B8860B', borderBottom: '1px solid #B8860B', padding: '5px 0', display: 'inline-block', width: '80%' }}>
                                            <div style={{ letterSpacing: 4, fontWeight: 'bold', color: '#B8860B' }}>
                                                {isPdfHindi ? 'विवाह बायोडाटा' : 'MARRIAGE BIODATA'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Photo & Name Center */}
                                    <div className="profile-photo">
                                        {primaryPhoto && <img src={primaryPhoto} alt="Profile" />}
                                        <h2 style={{ fontSize: 28, color: '#2C1810', marginTop: 15 }}>{profile.fullName}</h2>
                                    </div>

                                    {renderSection('personal', FIELD_GROUPS.personal)}
                                    {renderSection('family', FIELD_GROUPS.family)}
                                    {renderSection('education', FIELD_GROUPS.education)}
                                    {renderSection('religious', FIELD_GROUPS.religious)}

                                    <div style={{ textAlign: 'center', marginTop: 30 }}>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/public/' + (profile.customId || profile._id))}`}
                                            alt="QR"
                                            style={{ width: 60, height: 60, border: '1px solid #B8860B', padding: 2 }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 3. CLASSIC TEMPLATE RENDER (Keep existing logic but adapted) */}
                        {selectedTemplate === 'classic' && (() => {
                            const selectedHeader = RELIGIOUS_HEADERS.find(h => h.key === headerType);
                            return (
                                <div style={{ padding: 20 }}>
                                    {/* Classic Header */}
                                    {headerType !== 'none' && (
                                        <div className="biodata-header" style={{ borderColor: selectedHeader.primaryColor }}>
                                            <div style={{ fontSize: 24 }}>{selectedHeader.icon}</div>
                                            <h1 style={{ color: selectedHeader.primaryColor }}>{selectedHeader.label}</h1>
                                        </div>
                                    )}

                                    <div className="clearfix" style={{ marginBottom: 20 }}>
                                        {primaryPhoto && (
                                            <div className="profile-photo-classic">
                                                <img src={primaryPhoto} alt="Profile" style={{ borderColor: selectedHeader.primaryColor }} />
                                            </div>
                                        )}
                                        <div>
                                            <h2 style={{ fontSize: 22, color: '#333' }}>{profile.fullName}</h2>
                                            <div style={{ color: '#666', marginTop: 4 }}>
                                                {profile.age} {isPdfHindi ? 'वर्ष' : 'Yrs'}, {profile.heightCm} cm <br />
                                                {profile.education}, {profile.profession}
                                            </div>
                                        </div>
                                    </div>

                                    {Object.entries(FIELD_GROUPS).map(([key, group]) => renderSection(key, group))}

                                    <div style={{ marginTop: 20, textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 10 }}>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/public/' + (profile.customId || profile._id))}`}
                                            alt="QR"
                                            style={{ width: 80, height: 80 }}
                                        />
                                        <div style={{ fontSize: 10, color: '#999' }}>Scan to View Full Profile</div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 4. FLORAL TEMPLATE RENDER */}
                        {selectedTemplate === 'floral' && (() => {
                            const selectedHeader = RELIGIOUS_HEADERS.find(h => h.key === headerType);
                            return (
                                <div>
                                    <div className="biodata-header">
                                        <h1>{selectedHeader?.label || (isPdfHindi ? 'शुभ विवाह' : 'MARRIAGE BIODATA')}</h1>
                                    </div>

                                    <div className="profile-photo-floral">
                                        {primaryPhoto && <img src={primaryPhoto} alt="Profile" />}
                                        <h2 style={{ fontSize: 26, color: '#D44D5C', marginTop: 15 }}>{profile.fullName}</h2>
                                    </div>

                                    <div style={{ padding: '0 20px' }}>
                                        {renderSection('personal', FIELD_GROUPS.personal)}
                                        {renderSection('education', FIELD_GROUPS.education)}
                                        {renderSection('family', FIELD_GROUPS.family)}
                                        {renderSection('religious', FIELD_GROUPS.religious)}
                                    </div>

                                    <div style={{ textAlign: 'center', marginTop: 30, paddingBottom: 20 }}>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/public/' + (profile.customId || profile._id))}`}
                                            alt="QR"
                                            style={{ width: 60, height: 60, opacity: 0.8 }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 5. PROFESSIONAL TEMPLATE RENDER */}
                        {selectedTemplate === 'professional' && (() => {
                            return (
                                <div>
                                    <div className="biodata-header">
                                        <div className="header-left">
                                            <h1>{profile.fullName}</h1>
                                            <div style={{ color: '#7f8c8d', fontSize: 13, marginTop: 5 }}>
                                                {profile.age} {isPdfHindi ? 'वर्ष' : 'Yrs'} | {profile.education} | {profile.profession}
                                            </div>
                                        </div>
                                        {primaryPhoto && (
                                            <div className="profile-photo-prof">
                                                <img src={primaryPhoto} alt="Profile" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="field-grid">
                                        <div>
                                            {renderSection('personal', FIELD_GROUPS.personal)}
                                            {renderSection('location', FIELD_GROUPS.location)}
                                        </div>
                                        <div>
                                            {renderSection('family', FIELD_GROUPS.family)}
                                            {renderSection('religious', FIELD_GROUPS.religious)}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 20 }}>
                                        {renderSection('education', FIELD_GROUPS.education)}
                                        {renderSection('about', FIELD_GROUPS.about)}
                                    </div>

                                    <div style={{ marginTop: 30, borderTop: '1px solid #2C3E50', paddingTop: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: 10, color: '#7f8c8d' }}>
                                            {isPdfHindi ? 'डिजीटल प्रोफाइल के लिए स्कैन करें' : 'Scan for full digital profile'}
                                        </div>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/public/' + (profile.customId || profile._id))}`}
                                            alt="QR"
                                            style={{ width: 50, height: 50 }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                    </div>
                </Col>

            </Row>
        </Modal >
    );
}

export default BiodataPDF;
