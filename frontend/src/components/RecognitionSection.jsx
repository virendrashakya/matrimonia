import { useState } from 'react';
import { Card, Typography, Button, Form, Radio, Input, Space, Statistic, Row, Col, Alert } from 'antd';
import { CheckCircleOutlined, TeamOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import api from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

function RecognitionSection({ profileId, recognition, onRecognitionAdded, isVerified }) {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const levelColors = {
        new: '#9CA3AF',
        low: '#F59E0B',
        moderate: '#10B981',
        high: '#059669'
    };

    const recognitionTypes = [
        { value: 'know_personally', label: 'I know them personally' },
        { value: 'know_family', label: 'I know their family' },
        { value: 'verified_documents', label: 'I verified their documents' },
        { value: 'community_reference', label: 'Community reference' }
    ];

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await api.post(`/profiles/${profileId}/recognitions`, values);
            toast.success('Recognition added successfully!');
            setShowForm(false);
            form.resetFields();
            if (onRecognitionAdded) onRecognitionAdded();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add recognition');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Recognition Score" style={{ marginTop: 24 }}>
            <Row gutter={48} style={{ marginBottom: 24 }}>
                <Col>
                    <Statistic
                        title="Score"
                        value={recognition?.score?.toFixed(1) || '0.0'}
                        valueStyle={{ color: levelColors[recognition?.level || 'new'], fontSize: 48 }}
                        suffix={<Text type="secondary" style={{ fontSize: 16 }}>{(recognition?.level || 'new').toUpperCase()}</Text>}
                    />
                </Col>
                <Col>
                    <Statistic
                        title="People Recognise"
                        value={recognition?.recogniserCount || 0}
                        prefix={<TeamOutlined />}
                    />
                </Col>
            </Row>

            {!isVerified ? (
                <Alert
                    message="Verification Required"
                    description="Only verified users can add recognition. Contact an admin to get verified."
                    type="warning"
                    showIcon
                />
            ) : !showForm ? (
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setShowForm(true)} size="large">
                    I Know This Person
                </Button>
            ) : (
                <Card type="inner" title="Add Your Recognition">
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            name="type"
                            label="How do you know them?"
                            rules={[{ required: true, message: 'Please select recognition type' }]}
                        >
                            <Radio.Group>
                                <Space direction="vertical">
                                    {recognitionTypes.map(type => (
                                        <Radio key={type.value} value={type.value}>{type.label}</Radio>
                                    ))}
                                </Space>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item name="relationship" label="Relationship (optional)">
                            <Input placeholder="e.g., Family friend, Neighbor, Colleague" />
                        </Form.Item>

                        <Form.Item name="notes" label="Notes (optional)">
                            <TextArea rows={3} placeholder="Any additional details..." />
                        </Form.Item>

                        <Alert
                            message="Your name will be recorded with this recognition"
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Submit Recognition
                            </Button>
                            <Button onClick={() => setShowForm(false)}>Cancel</Button>
                        </Space>
                    </Form>
                </Card>
            )}
        </Card>
    );
}

export default RecognitionSection;
