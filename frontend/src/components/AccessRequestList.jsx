import React, { useEffect, useState } from 'react';
import { List, Avatar, Button, Typography, Space, Tag, message, Spin, Empty, Card } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const AccessRequestList = ({ profileId, isHindi }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchRequests = async () => {
        try {
            // optimized: could add query param to backend, but filtering client side for now as per current implementation
            const response = await api.get('/access-requests/received');
            // Filter for this profile only
            const profileRequests = response.data.data.filter(r => r.targetProfile?._id === profileId);
            setRequests(profileRequests);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            message.error('Failed to load access requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profileId) {
            fetchRequests();
        }
    }, [profileId]);

    const handleAction = async (requestId, status) => {
        setProcessingId(requestId);
        try {
            await api.put(`/access-requests/${requestId}`, { status });
            message.success(status === 'approved' ? 'Request Approved' : 'Request Rejected');
            fetchRequests(); // Reload
        } catch (error) {
            message.error(error.response?.data?.error || 'Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <Spin />;

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const historyRequests = requests.filter(r => r.status !== 'pending');

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title={isHindi ? "लंबित अनुरोध" : "Pending Requests"} size="small">
                {pendingRequests.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={pendingRequests}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => handleAction(item._id, 'approved')}
                                        loading={processingId === item._id}
                                    >
                                        Approve
                                    </Button>,
                                    <Button
                                        danger
                                        size="small"
                                        icon={<CloseCircleOutlined />}
                                        onClick={() => handleAction(item._id, 'rejected')}
                                        loading={processingId === item._id}
                                    >
                                        Reject
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<UserOutlined />} />}
                                    title={<Text strong>{item.requester?.name || 'Unknown User'}</Text>}
                                    description={
                                        <Space direction="vertical" size={0}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {dayjs(item.createdAt).fromNow()}
                                            </Text>
                                            {item.message && (
                                                <Text style={{ marginTop: 4, display: 'block', fontStyle: 'italic' }}>
                                                    "{item.message}"
                                                </Text>
                                            )}
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description={isHindi ? "कोई लंबित अनुरोध नहीं" : "No pending requests"} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </Card>

            {historyRequests.length > 0 && (
                <Card title={isHindi ? "अनुरोध इतिहास" : "Request History"} size="small">
                    <List
                        itemLayout="horizontal"
                        dataSource={historyRequests}
                        renderItem={item => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar icon={<UserOutlined />} />}
                                    title={
                                        <Space>
                                            <Text strong>{item.requester?.name}</Text>
                                            <Tag color={item.status === 'approved' ? 'green' : 'red'}>{item.status.toUpperCase()}</Tag>
                                        </Space>
                                    }
                                    description={<Text type="secondary">{dayjs(item.updatedAt).format('DD MMM YYYY')}</Text>}
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            )}
        </Space>
    );
};

export default AccessRequestList;
