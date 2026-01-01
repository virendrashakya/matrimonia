import { useState, useEffect } from 'react';
import { Card, Form, Input, Select, InputNumber, Button, Row, Col, Typography, Spin, Empty, Space, Divider, Tag } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';
import ProfileCard from '../components/ProfileCard';
import api from '../services/api';
import { INDIAN_LOCATIONS, RELIGION_OPTIONS } from '../constants/locations';

const { Title, Text } = Typography;
const { Option } = Select;

function Search() {
    const { t } = useLanguage();
    const [form] = Form.useForm();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Watch state change to update cities
    const selectedState = Form.useWatch('state', form);
    const [cityOptions, setCityOptions] = useState([]);

    // Update cities when state changes
    useEffect(() => {
        if (selectedState && INDIAN_LOCATIONS[selectedState]) {
            setCityOptions(INDIAN_LOCATIONS[selectedState]);
            // If current city is not in new list, clear it
            const currentCity = form.getFieldValue('city');
            if (currentCity && !INDIAN_LOCATIONS[selectedState].includes(currentCity)) {
                form.setFieldsValue({ city: undefined });
            }
        } else {
            setCityOptions([]);
            form.setFieldsValue({ city: undefined });
        }
    }, [selectedState, form]);

    const handleSearch = async (values) => {
        setLoading(true);
        setSearched(true);
        try {
            const params = new URLSearchParams();
            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value);
                }
            });

            const response = await api.get(`/profiles?${params.toString()}&limit=20`);
            setResults(response.data.data.profiles);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        form.resetFields();
        setResults([]);
        setSearched(false);
    };

    return (
        <div style={{ padding: '32px 0' }}>
            <Title level={2} style={{ marginBottom: 24 }}>
                <SearchOutlined style={{ marginRight: 12, color: '#A0153E' }} />
                {t.search.title}
            </Title>

            <Row gutter={24}>
                {/* Filters */}
                <Col xs={24} md={8} lg={6}>
                    <Card
                        title={<><FilterOutlined /> {t.search.filters}</>}
                        style={{ borderRadius: 12, position: 'sticky', top: 80 }}
                    >
                        <Form form={form} layout="vertical" onFinish={handleSearch}>
                            <Form.Item label={t.search.ageRange}>
                                <Space>
                                    <Form.Item name="ageMin" noStyle>
                                        <InputNumber min={18} max={70} placeholder="18" style={{ width: 70 }} />
                                    </Form.Item>
                                    <Text type="secondary">{t.search.to}</Text>
                                    <Form.Item name="ageMax" noStyle>
                                        <InputNumber min={18} max={70} placeholder="50" style={{ width: 70 }} />
                                    </Form.Item>
                                </Space>
                            </Form.Item>

                            <Form.Item name="gender" label={t.addProfile?.gender || 'Gender'}>
                                <Select allowClear placeholder={t.search.any}>
                                    <Option value="male">{t.addProfile?.male || 'Male'}</Option>
                                    <Option value="female">{t.addProfile?.female || 'Female'}</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="religion" label="Religion">
                                <Select allowClear placeholder={t.search.any}>
                                    {RELIGION_OPTIONS.map(r => (
                                        <Option key={r} value={r}>{r}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="state" label={t.profileDetail?.state || 'State'}>
                                <Select allowClear showSearch placeholder={t.search.any}>
                                    {Object.keys(INDIAN_LOCATIONS).sort().map(s => <Option key={s} value={s}>{s}</Option>)}
                                </Select>
                            </Form.Item>

                            <Form.Item name="city" label={t.profileDetail?.city || 'City'}>
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder={selectedState ? t.search.any : "Select state first"}
                                    disabled={!selectedState}
                                >
                                    {cityOptions.sort().map(c => <Option key={c} value={c}>{c}</Option>)}
                                </Select>
                            </Form.Item>

                            <Form.Item name="maritalStatus" label={t.profileDetail?.maritalStatus || 'Marital Status'}>
                                <Select allowClear placeholder={t.search.any}>
                                    <Option value="never_married">{t.addProfile?.neverMarried || 'Never Married'}</Option>
                                    <Option value="divorced">{t.addProfile?.divorced || 'Divorced'}</Option>
                                    <Option value="widowed">{t.addProfile?.widowed || 'Widowed'}</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="diet" label="Diet">
                                <Select allowClear placeholder={t.search.any}>
                                    <Option value="vegetarian">Vegetarian</Option>
                                    <Option value="non_vegetarian">Non-Vegetarian</Option>
                                    <Option value="eggetarian">Eggetarian</Option>
                                </Select>
                            </Form.Item>

                            <Divider />

                            <Space style={{ width: '100%' }} direction="vertical">
                                <Button type="primary" htmlType="submit" block icon={<SearchOutlined />} loading={loading}>
                                    {t.search.searchBtn}
                                </Button>
                                <Button block icon={<ClearOutlined />} onClick={handleClear}>
                                    {t.search.clear}
                                </Button>
                            </Space>
                        </Form>
                    </Card>
                </Col>

                {/* Results */}
                <Col xs={24} md={16} lg={18}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                            <Spin size="large" />
                        </div>
                    ) : searched ? (
                        results.length > 0 ? (
                            <>
                                <div style={{ marginBottom: 16 }}>
                                    <Tag color="green">{t.search.found} {results.length} {t.search.profilesFound}</Tag>
                                </div>
                                <div className="profile-grid">
                                    {results.map(profile => (
                                        <ProfileCard key={profile._id} profile={profile} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Card style={{ borderRadius: 12, textAlign: 'center', padding: 60 }}>
                                <Empty
                                    image={<div style={{ fontSize: 64 }}>🔍</div>}
                                    description={
                                        <Space direction="vertical">
                                            <Title level={4} style={{ color: '#8B7355' }}>{t.search.noResults}</Title>
                                            <Text type="secondary">{t.search.adjustFilters}</Text>
                                        </Space>
                                    }
                                />
                            </Card>
                        )
                    ) : (
                        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 60, background: '#FFFBF5' }}>
                            <Empty
                                image={<div style={{ fontSize: 64 }}>🔍</div>}
                                description={
                                    <Space direction="vertical">
                                        <Title level={4} style={{ color: '#8B7355' }}>{t.search.title}</Title>
                                        <Text type="secondary">{t.search.useFilters}</Text>
                                    </Space>
                                }
                            />
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default Search;
