import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Upload, Button, Typography, Table, Statistic, Row, Col, Steps, Alert, Space, List } from 'antd';
import { InboxOutlined, EyeOutlined, ImportOutlined, CheckCircleOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

function ImportWhatsApp() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [importResult, setImportResult] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    const handleFileChange = (info) => {
        const selectedFile = info.file;
        const validExtensions = ['.txt', '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
        const isValid = validExtensions.some(ext => selectedFile?.name.toLowerCase().endsWith(ext));

        if (selectedFile && isValid) {
            setFile(selectedFile);
            setPreview(null);
            setImportResult(null);
            setCurrentStep(1);

            if (!selectedFile.name.endsWith('.txt')) {
                toast('PDF/DOC/Image parsing requires AI integration (coming soon)', { icon: 'ℹ️' });
            }
        } else {
            toast.error('Please select a supported file format');
        }
        return false; // Prevent auto upload
    };

    const handlePreview = async () => {
        if (!file) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/import/whatsapp?preview=true', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setPreview(response.data.data);
            setCurrentStep(2);
            toast.success(`Found ${response.data.data.count} biodata entries`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to parse file');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/import/whatsapp', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setImportResult(response.data.data);
            setCurrentStep(3);
            toast.success(`Imported ${response.data.data.imported} profiles!`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'fullName', key: 'fullName', render: (v) => v || 'Unknown' },
        { title: 'Gender', dataIndex: 'gender', key: 'gender', render: (v) => v || '-' },
        { title: 'Caste', dataIndex: 'caste', key: 'caste', render: (v) => v || '-' },
        { title: 'City', dataIndex: 'city', key: 'city', render: (v) => v || '-' },
        { title: 'Education', dataIndex: 'education', key: 'education', render: (v) => v || '-' },
    ];

    return (
        <div style={{ padding: '24px 0' }}>
            <Title level={2}>Import Profiles</Title>
            <Paragraph type="secondary" style={{ marginBottom: 32 }}>
                Upload files to import matrimonial profiles in bulk
            </Paragraph>

            <Steps
                current={currentStep}
                items={[
                    { title: 'Upload File' },
                    { title: 'Preview' },
                    { title: 'Import' },
                    { title: 'Complete' },
                ]}
                style={{ marginBottom: 32 }}
            />

            {/* Step 1: Instructions */}
            <Card title="How to Export from WhatsApp" style={{ marginBottom: 24 }}>
                <List
                    size="small"
                    dataSource={[
                        'Open your WhatsApp matrimonial group',
                        'Tap the group name → More → Export chat',
                        'Choose "Without media" for faster export',
                        'Save the .txt file to your device',
                    ]}
                    renderItem={(item, index) => (
                        <List.Item>
                            <Text>{index + 1}. {item}</Text>
                        </List.Item>
                    )}
                />
            </Card>

            {/* Step 2: Upload */}
            <Card title="Upload File" style={{ marginBottom: 24 }}>
                <Dragger
                    accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                    beforeUpload={handleFileChange}
                    showUploadList={false}
                    disabled={loading}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                        {file ? file.name : 'Click or drag file to upload'}
                    </p>
                    <p className="ant-upload-hint">
                        Supported: .txt (WhatsApp), .pdf, .doc, images
                    </p>
                    <Text type="warning" style={{ fontSize: 12 }}>
                        Note: PDF/DOC/images require AI (coming soon)
                    </Text>
                </Dragger>

                {file && !preview && !importResult && (
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={handlePreview}
                        loading={loading}
                        style={{ marginTop: 16, width: '100%' }}
                        size="large"
                    >
                        Preview Extracted Data
                    </Button>
                )}
            </Card>

            {/* Step 3: Preview */}
            {preview && (
                <Card title={`Preview (${preview.count} profiles found)`} style={{ marginBottom: 24 }}>
                    <Table
                        columns={columns}
                        dataSource={preview.preview.map((item, i) => ({ ...item, key: i }))}
                        pagination={false}
                        scroll={{ x: true }}
                        size="small"
                    />

                    {preview.count > 10 && (
                        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
                            Showing first 10 of {preview.count} entries
                        </Text>
                    )}

                    <Space style={{ marginTop: 24 }}>
                        <Button
                            type="primary"
                            icon={<ImportOutlined />}
                            onClick={handleImport}
                            loading={loading}
                            size="large"
                        >
                            Import {preview.count} Profiles
                        </Button>
                        <Button onClick={() => { setFile(null); setPreview(null); setCurrentStep(0); }}>
                            Cancel
                        </Button>
                    </Space>
                </Card>
            )}

            {/* Step 4: Results */}
            {importResult && (
                <Card>
                    <Alert
                        message="Import Complete"
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                        style={{ marginBottom: 24 }}
                    />

                    <Row gutter={24} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                            <Statistic title="Total Found" value={importResult.total} />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Imported" value={importResult.imported} valueStyle={{ color: '#10B981' }} />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Skipped" value={importResult.skipped} valueStyle={{ color: '#F59E0B' }} />
                        </Col>
                    </Row>

                    {importResult.errors.length > 0 && (
                        <Alert
                            message="Skipped Entries"
                            description={
                                <List
                                    size="small"
                                    dataSource={importResult.errors}
                                    renderItem={(err) => <List.Item>{err.name}: {err.reason}</List.Item>}
                                />
                            }
                            type="warning"
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    <Button type="primary" onClick={() => navigate('/profiles')} size="large">
                        View Imported Profiles
                    </Button>
                </Card>
            )}
        </div>
    );
}

export default ImportWhatsApp;
