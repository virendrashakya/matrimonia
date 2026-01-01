import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Input, Button, Space, Spin, message, Tabs, List, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { Title, Text } = Typography;

const FIELD_LABELS = {
    castes: 'Castes',
    subCastes: 'Sub-Castes',
    occupations: 'Occupations',
    educations: 'Education Levels',
    motherTongues: 'Mother Tongues',
    religions: 'Religions',
    maritalStatuses: 'Marital Statuses',
    diets: 'Diets',
    mangaliks: 'Mangalik Options'
};

function AdminConfig() {
    const { user } = useAuth();
    const [options, setOptions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [activeField, setActiveField] = useState('castes');

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const response = await api.get('/admin/config/options');
            setOptions(response.data.data.options);
        } catch (error) {
            console.error('Failed to fetch options:', error);
            message.error('Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (field, values) => {
        setSaving(true);
        try {
            await api.put('/admin/config/options', { field, values });
            message.success(`${FIELD_LABELS[field]} updated successfully`);
            fetchOptions();
        } catch (error) {
            message.error(error.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleAddValue = () => {
        if (!newValue.trim()) return;
        if (options[activeField].includes(newValue.trim())) {
            message.warning('This option already exists');
            return;
        }
        const newValues = [...options[activeField], newValue.trim()];
        handleSave(activeField, newValues);
        setNewValue('');
    };

    const handleRemoveValue = (field, value) => {
        const newValues = options[field].filter(v => v !== value);
        handleSave(field, newValues);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!options) {
        return <Text type="danger">Failed to load configuration</Text>;
    }

    const tabItems = Object.keys(FIELD_LABELS).map(field => ({
        key: field,
        label: FIELD_LABELS[field],
        children: (
            <Card size="small">
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                        {options[field]?.length || 0} options configured
                    </Text>
                </div>

                {isAdmin && (
                    <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                        <Input
                            placeholder={`Add new ${FIELD_LABELS[field].toLowerCase().slice(0, -1)}`}
                            value={activeField === field ? newValue : ''}
                            onChange={(e) => {
                                setActiveField(field);
                                setNewValue(e.target.value);
                            }}
                            onPressEnter={handleAddValue}
                            style={{ maxWidth: 300 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddValue}
                            loading={saving}
                        >
                            Add
                        </Button>
                    </div>
                )}

                <List
                    size="small"
                    bordered
                    dataSource={options[field] || []}
                    renderItem={(item, index) => (
                        <List.Item
                            actions={isAdmin ? [
                                <Popconfirm
                                    key="delete"
                                    title="Remove this option?"
                                    onConfirm={() => handleRemoveValue(field, item)}
                                >
                                    <Button size="small" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            ] : []}
                        >
                            <Tag color="blue">{index + 1}</Tag> {item}
                        </List.Item>
                    )}
                    style={{ maxHeight: 400, overflow: 'auto' }}
                />
            </Card>
        )
    }));

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3}>
                    <SettingOutlined style={{ marginRight: 8 }} />
                    Configuration Management
                </Title>
                <Text type="secondary">
                    {isAdmin
                        ? 'Manage dropdown options for profile forms. Changes apply immediately.'
                        : 'View dropdown options (admin only can edit).'}
                </Text>
            </div>

            <Tabs
                items={tabItems}
                tabPosition="left"
                style={{ minHeight: 500 }}
            />
        </div>
    );
}

export default AdminConfig;
