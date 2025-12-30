/**
 * ProfileQRCode - Generate QR code for profile with download option
 */

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal, Button, Space, Typography, message } from 'antd';
import { DownloadOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';

const { Text, Title } = Typography;

function ProfileQRCode({ profile, visible, onClose }) {
    const { isHindi } = useLanguage();
    const qrRef = useRef(null);

    const profileUrl = `${window.location.origin}/public/${profile?.customId || profile?._id}`;

    const handleDownload = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        // Convert SVG to canvas then to PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        img.onload = () => {
            canvas.width = 300;
            canvas.height = 350; // Extra space for name

            // White background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw QR code
            ctx.drawImage(img, 50, 20, 200, 200);

            // Add profile name
            ctx.fillStyle = '#2C1810';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(profile.fullName, 150, 250);

            // Add details
            ctx.font = '12px Arial';
            ctx.fillStyle = '#8B7355';
            ctx.fillText(`${profile.age} yrs • ${profile.city}`, 150, 275);

            // Add brand
            ctx.font = '10px Arial';
            ctx.fillStyle = '#A0153E';
            ctx.fillText('Pehchan • Scan to view profile', 150, 340);

            // Download
            const link = document.createElement('a');
            link.download = `${profile.fullName.replace(/\s+/g, '_')}_QR.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            message.success(isHindi ? 'QR कोड डाउनलोड हो गया!' : 'QR Code downloaded!');
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    if (!profile) return null;

    return (
        <Modal
            title={
                <Space>
                    <QrcodeOutlined style={{ color: '#A0153E' }} />
                    {isHindi ? 'प्रोफ़ाइल QR कोड' : 'Profile QR Code'}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    {isHindi ? 'बंद करें' : 'Close'}
                </Button>,
                <Button
                    key="download"
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    style={{ background: 'linear-gradient(135deg, #A0153E, #7A0F2E)' }}
                >
                    {isHindi ? 'डाउनलोड करें' : 'Download PNG'}
                </Button>
            ]}
            width={400}
        >
            <div style={{ textAlign: 'center', padding: 20 }} ref={qrRef}>
                <QRCodeSVG
                    value={profileUrl}
                    size={180}
                    level="H"
                    includeMargin={true}
                    fgColor="#2C1810"
                    style={{
                        border: '8px solid #A0153E',
                        borderRadius: 12,
                        padding: 8,
                        background: 'white'
                    }}
                />

                <div style={{ marginTop: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>{profile.fullName}</Title>
                    <Text type="secondary">
                        {profile.age} {isHindi ? 'वर्ष' : 'yrs'} • {profile.city}
                    </Text>
                </div>

                <div style={{ marginTop: 16, padding: 12, background: '#FFF8F0', borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: '#8B7355' }}>
                        {isHindi
                            ? 'इस QR कोड को स्कैन करके प्रोफ़ाइल देखें'
                            : 'Scan this QR code to view the profile'}
                    </Text>
                </div>
            </div>
        </Modal>
    );
}

export default ProfileQRCode;
