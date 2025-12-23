import { useState } from 'react';
import { Upload, Button, Image, Space, Card, Typography, message, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import api from '../services/api';

const { Text } = Typography;

function PhotoGallery({ profileId, photos = [], onPhotosUpdated, editable = false }) {
    const [uploading, setUploading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('photo', file);

        setUploading(true);
        try {
            await api.post(`/upload/profiles/${profileId}/photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Photo uploaded successfully');
            if (onPhotosUpdated) onPhotosUpdated();
        } catch (error) {
            message.error(error.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
        return false; // Prevent auto upload
    };

    const handleDelete = async (photoUrl) => {
        try {
            await api.delete(`/upload/profiles/${profileId}/photos`, {
                data: { photoUrl }
            });
            message.success('Photo deleted');
            if (onPhotosUpdated) onPhotosUpdated();
        } catch (error) {
            message.error('Failed to delete photo');
        }
    };

    const handleSetPrimary = async (photoUrl) => {
        try {
            await api.patch(`/upload/profiles/${profileId}/photos/primary`, { photoUrl });
            message.success('Primary photo set');
            if (onPhotosUpdated) onPhotosUpdated();
        } catch (error) {
            message.error('Failed to set primary photo');
        }
    };

    const handlePreview = (url) => {
        setPreviewImage(url);
        setPreviewOpen(true);
    };

    // Sort to show primary first
    const sortedPhotos = [...photos].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

    return (
        <Card title={`Photos (${photos.length})`} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {sortedPhotos.map((photo, index) => (
                    <div
                        key={photo.url || index}
                        style={{
                            position: 'relative',
                            border: photo.isPrimary ? '3px solid #8B4513' : '1px solid #d9d9d9',
                            borderRadius: 8,
                            overflow: 'hidden'
                        }}
                    >
                        <Image
                            src={photo.url}
                            width={150}
                            height={180}
                            style={{ objectFit: 'cover', cursor: 'pointer' }}
                            preview={false}
                            onClick={() => handlePreview(photo.url)}
                        />
                        {photo.isPrimary && (
                            <div style={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                background: '#8B4513',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 12
                            }}>
                                Primary
                            </div>
                        )}
                        {editable && (
                            <Space style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(0,0,0,0.5)',
                                padding: 8,
                                justifyContent: 'center'
                            }}>
                                {!photo.isPrimary && (
                                    <Button
                                        size="small"
                                        icon={<StarOutlined />}
                                        onClick={() => handleSetPrimary(photo.url)}
                                        title="Set as primary"
                                    />
                                )}
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(photo.url)}
                                    title="Delete"
                                />
                            </Space>
                        )}
                    </div>
                ))}

                {editable && photos.length < 5 && (
                    <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={handleUpload}
                        disabled={uploading}
                    >
                        <div style={{
                            width: 150,
                            height: 180,
                            border: '1px dashed #d9d9d9',
                            borderRadius: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            background: '#fafafa'
                        }}>
                            <PlusOutlined style={{ fontSize: 24, color: '#999' }} />
                            <Text type="secondary" style={{ marginTop: 8 }}>
                                {uploading ? 'Uploading...' : 'Add Photo'}
                            </Text>
                        </div>
                    </Upload>
                )}
            </div>

            <Modal
                open={previewOpen}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
            >
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>

            {photos.length === 0 && !editable && (
                <Text type="secondary">No photos uploaded</Text>
            )}
        </Card>
    );
}

export default PhotoGallery;
