import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, InputNumber, Button, Row, Col, Typography, Divider, Space, Steps, Alert, Spin, Modal, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

function EditProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const response = await api.get(`/profiles/${id}`);
            const profileData = response.data.data.profile;
            setProfile(profileData);

            // Set form values
            form.setFieldsValue({
                ...profileData,
                dateOfBirth: profileData.dateOfBirth ? dayjs(profileData.dateOfBirth) : null,
            });
        } catch (error) {
            toast.error('Failed to load profile');
            navigate('/profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            if (values.dateOfBirth) {
                values.dateOfBirth = values.dateOfBirth.toISOString();
            }

            await api.put(`/profiles/${id}`, values);
            toast.success('Profile updated successfully!');
            navigate(`/profiles/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Modal.confirm({
            title: 'Delete Profile',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure you want to delete this profile? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await api.delete(`/profiles/${id}`);
                    toast.success('Profile deleted successfully');
                    navigate('/profiles');
                } catch (error) {
                    toast.error(error.response?.data?.error || 'Failed to delete profile');
                }
            },
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    const isOwner = profile?.createdBy === user?._id || profile?.createdBy?._id === user?._id;
    const canEdit = isOwner || ['admin', 'moderator'].includes(user?.role);

    if (!canEdit) {
        return (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <Alert type="error" message="You don't have permission to edit this profile" />
                <Link to={`/profiles/${id}`}>
                    <Button style={{ marginTop: 16 }}>Back to Profile</Button>
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link to={`/profiles/${id}`}>
                        <Button icon={<ArrowLeftOutlined />}>Back</Button>
                    </Link>
                    <Title level={2} style={{ margin: 0 }}>Edit Profile</Title>
                </div>
                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                    Delete Profile
                </Button>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* Basic Info */}
                <Card title="Basic Information" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
                                <Input placeholder="Full name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="male">Male</Option>
                                    <Option value="female">Female</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="email" label="Email">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="maritalStatus" label="Marital Status">
                                <Select>
                                    <Option value="never_married">Never Married</Option>
                                    <Option value="divorced">Divorced</Option>
                                    <Option value="widowed">Widowed</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Demographics */}
                <Card title="Demographics & Location" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="caste" label="Caste" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="subCaste" label="Sub-Caste">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="gotra" label="Gotra">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="city" label="City" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="state" label="State" rules={[{ required: true }]}>
                                <Select showSearch>
                                    {INDIAN_STATES.map(s => <Option key={s} value={s}>{s}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="nativePlace" label="Native Place">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Education & Career */}
                <Card title="Education & Career" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="education" label="Education" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="profession" label="Profession" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="company" label="Company">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="annualIncome" label="Annual Income">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Physical & Lifestyle */}
                <Card title="Physical & Lifestyle" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col xs={12} sm={6}>
                            <Form.Item name="heightCm" label="Height (cm)">
                                <InputNumber min={100} max={250} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Form.Item name="weightKg" label="Weight (kg)">
                                <InputNumber min={30} max={200} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item name="complexion" label="Complexion">
                                <Select allowClear>
                                    <Option value="very_fair">Very Fair</Option>
                                    <Option value="fair">Fair</Option>
                                    <Option value="wheatish">Wheatish</Option>
                                    <Option value="wheatish_brown">Wheatish Brown</Option>
                                    <Option value="dark">Dark</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Form.Item name="bodyType" label="Body Type">
                                <Select allowClear>
                                    <Option value="slim">Slim</Option>
                                    <Option value="average">Average</Option>
                                    <Option value="athletic">Athletic</Option>
                                    <Option value="heavy">Heavy</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="diet" label="Diet">
                                <Select>
                                    <Option value="vegetarian">Vegetarian</Option>
                                    <Option value="non_vegetarian">Non-Vegetarian</Option>
                                    <Option value="eggetarian">Eggetarian</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="smoking" label="Smoking">
                                <Select>
                                    <Option value="no">No</Option>
                                    <Option value="occasionally">Occasionally</Option>
                                    <Option value="yes">Yes</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="drinking" label="Drinking">
                                <Select>
                                    <Option value="no">No</Option>
                                    <Option value="occasionally">Occasionally</Option>
                                    <Option value="yes">Yes</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="aboutMe" label="About Me">
                        <TextArea rows={3} maxLength={1000} showCount />
                    </Form.Item>
                </Card>

                {/* Family */}
                <Card title="Family Details" style={{ marginBottom: 24 }}>
                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="fatherName" label="Father's Name">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="fatherOccupation" label="Father's Occupation">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="motherName" label="Mother's Name">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="siblings" label="Siblings">
                                <Input placeholder="e.g., 2 brothers, 1 sister" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="familyType" label="Family Type">
                                <Select>
                                    <Option value="nuclear">Nuclear</Option>
                                    <Option value="joint">Joint</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="familyStatus" label="Family Status">
                                <Select allowClear>
                                    <Option value="middle_class">Middle Class</Option>
                                    <Option value="upper_middle_class">Upper Middle Class</Option>
                                    <Option value="rich">Rich</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="familyValues" label="Family Values">
                                <Select allowClear>
                                    <Option value="traditional">Traditional</Option>
                                    <Option value="moderate">Moderate</Option>
                                    <Option value="liberal">Liberal</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Submit */}
                <Card>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />} size="large">
                            Save Changes
                        </Button>
                        <Link to={`/profiles/${id}`}>
                            <Button size="large">Cancel</Button>
                        </Link>
                    </Space>
                </Card>
            </Form>
        </div>
    );
}

export default EditProfile;
