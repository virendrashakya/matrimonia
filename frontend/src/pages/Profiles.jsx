import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Typography, Spin, Empty, Pagination, Space, Card, Row, Col, Segmented, Table, Tag } from 'antd';
import { PlusOutlined, TeamOutlined, AppstoreOutlined, BarsOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';
import ProfileCard from '../components/ProfileCard';
import api from '../services/api';

const { Title, Text } = Typography;

function Profiles() {
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const isAdminContext = location.pathname.startsWith('/admin');
    const [profiles, setProfiles] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        fetchProfiles(1);
    }, []);

    const fetchProfiles = async (page) => {
        setLoading(true);
        try {
            const response = await api.get(`/profiles?page=${page}&limit=${isAdminContext ? 20 : 12}`);
            setProfiles(response.data.data.profiles);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    // Admin table columns
    const adminColumns = [
        {
            title: 'ID',
            dataIndex: 'customId',
            key: 'customId',
            width: 120,
        },
        {
            title: 'Name',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text, record) => (
                <Link to={`/admin/profiles/${record._id}`}>{text}</Link>
            ),
        },
        {
            title: 'Age',
            key: 'age',
            width: 60,
            render: (_, record) => {
                if (!record.dateOfBirth) return '-';
                const age = Math.floor((Date.now() - new Date(record.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
                return age;
            },
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            width: 80,
            render: (gender) => gender === 'male' ? '👨' : '👩',
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
        },
        {
            title: 'Status',
            dataIndex: 'verificationStatus',
            key: 'verificationStatus',
            width: 100,
            render: (status) => {
                const colors = { approved: 'green', pending: 'orange', rejected: 'red' };
                return <Tag color={colors[status] || 'default'}>{status}</Tag>;
            },
        },
        {
            title: 'Created By',
            key: 'createdBy',
            render: (_, record) => record.createdBy?.name || '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/admin/profiles/${record._id}`)} />
                    <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/profiles/${record._id}/edit`)} />
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    // Admin table view
    if (isAdminContext) {
        return (
            <div style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>All Profiles ({pagination.total})</Title>
                </div>
                <Table
                    columns={adminColumns}
                    dataSource={profiles.map(p => ({ ...p, key: p._id }))}
                    pagination={{
                        current: pagination.page,
                        total: pagination.total,
                        pageSize: 20,
                        onChange: (page) => fetchProfiles(page),
                        showSizeChanger: false,
                    }}
                    size="small"
                    scroll={{ x: 800 }}
                />
            </div>
        );
    }

    // Regular user card view
    return (
        <div style={{ padding: '32px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        <TeamOutlined style={{ marginRight: 12, color: '#A0153E' }} />
                        {t.profiles.allProfiles}
                    </Title>
                    <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                        {pagination.total} {t.profiles.activeMatrimonial}
                    </Text>
                </div>
                <Space>
                    <Segmented
                        options={[
                            { value: 'grid', icon: <AppstoreOutlined /> },
                            { value: 'list', icon: <BarsOutlined /> },
                        ]}
                        value={viewMode}
                        onChange={setViewMode}
                    />
                    <Link to="/profiles/new">
                        <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 8 }}>
                            {t.profiles.addNew}
                        </Button>
                    </Link>
                </Space>
            </div>

            {profiles.length > 0 ? (
                <>
                    <Row gutter={[24, 24]}>
                        {profiles.map(profile => (
                            <Col
                                xs={24}
                                sm={viewMode === 'list' ? 24 : 12}
                                md={viewMode === 'list' ? 24 : 8}
                                lg={viewMode === 'list' ? 24 : 8}
                                xl={viewMode === 'list' ? 24 : 6}
                                key={profile._id}
                            >
                                <ProfileCard profile={profile} viewMode={viewMode} />
                            </Col>
                        ))}
                    </Row>

                    {pagination.pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48, padding: 24, background: '#FFFBF5', borderRadius: 12 }}>
                            <Pagination
                                current={pagination.page}
                                total={pagination.total}
                                pageSize={12}
                                onChange={(page) => fetchProfiles(page)}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </>
            ) : (
                <Card style={{ borderRadius: 12, textAlign: 'center', padding: 60, background: '#FFFBF5' }}>
                    <Empty
                        image={<div style={{ fontSize: 80 }}>🪔</div>}
                        description={
                            <Space direction="vertical" size={8}>
                                <Title level={4} style={{ color: '#8B7355', margin: 0 }}>{t.dashboard.noProfiles}</Title>
                                <Text type="secondary">{t.dashboard.beFirst}</Text>
                            </Space>
                        }
                    >
                        <Link to="/profiles/new">
                            <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 16 }}>
                                {t.dashboard.addFirstProfile}
                            </Button>
                        </Link>
                    </Empty>
                </Card>
            )}
        </div>
    );
}

export default Profiles;
