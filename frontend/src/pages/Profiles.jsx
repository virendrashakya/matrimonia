import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Spin, Empty, Pagination, Space, Card, Row, Col } from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';
import ProfileCard from '../components/ProfileCard';
import api from '../services/api';

const { Title, Text } = Typography;

function Profiles() {
    const { t } = useLanguage();
    const [profiles, setProfiles] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfiles(1);
    }, []);

    const fetchProfiles = async (page) => {
        setLoading(true);
        try {
            const response = await api.get(`/profiles?page=${page}&limit=12`);
            setProfiles(response.data.data.profiles);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 0' }}>
            {/* Header */}
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
                <Link to="/profiles/new">
                    <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 8 }}>
                        {t.profiles.addNew}
                    </Button>
                </Link>
            </div>

            {profiles.length > 0 ? (
                <>
                    <Row gutter={[24, 24]}>
                        {profiles.map(profile => (
                            <Col xs={24} sm={12} md={8} lg={8} xl={6} key={profile._id}>
                                <ProfileCard profile={profile} />
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
