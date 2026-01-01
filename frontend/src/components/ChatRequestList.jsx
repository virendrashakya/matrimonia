import React, { useEffect, useState } from 'react';
import { List, Avatar, Button, Typography, Space, message, Spin, Empty, Card } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

const ChatRequestList = ({ isHindi }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/chat/requests');
            setRequests(response.data.data);
        } catch (error) {
            console.error('Failed to fetch chat requests:', error);
            message.error('Failed to load chat requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId, status) => {
        setProcessingId(requestId);
        try {
            await api.put(`/chat/request/${requestId}`, { status });
            message.success(status === 'accepted' ? 'Request Accepted' : 'Request Rejected');
            fetchRequests(); // Reload
        } catch (error) {
            message.error(error.response?.data?.error || 'Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <Spin />;

    return (
        <Card title={isHindi ? "चैट अनुरोध" : "Chat Requests"} size="small">
            {requests.length > 0 ? (
                <List
                    itemLayout="horizontal"
                    dataSource={requests}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => handleAction(item._id, 'accepted')}
                                    loading={processingId === item._id}
                                >
                                    Accept
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
    );
};

export default ChatRequestList;
