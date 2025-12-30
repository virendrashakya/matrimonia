import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';

const { Text } = Typography;

function ServerError() {
    const navigate = useNavigate();
    const { isHindi } = useLanguage();

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
        }}>
            <Result
                status="500"
                title={
                    <span style={{ fontFamily: 'Playfair Display, serif', color: 'var(--primary)', fontSize: 36 }}>
                        500
                    </span>
                }
                subTitle={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: 500 }}>
                            {isHindi ? 'सर्वर में त्रुटि' : 'Server Error'}
                        </Text>
                        <Text type="secondary">
                            {isHindi
                                ? 'क्षमा करें, हमारे सर्वर पर कुछ गलत हो गया। कृपया पुन: प्रयास करें।'
                                : 'Sorry, something went wrong on our server. Please try again later.'}
                        </Text>
                    </div>
                }
                extra={
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                        <Button
                            size="large"
                            icon={<ReloadOutlined />}
                            onClick={() => window.location.reload()}
                        >
                            {isHindi ? 'पुन: लोड करें' : 'Reload'}
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            icon={<HomeOutlined />}
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                border: 'none',
                                padding: '0 32px',
                                height: 45
                            }}
                        >
                            {isHindi ? 'होम पर जाएं' : 'Back Home'}
                        </Button>
                    </div>
                }
            />
        </div>
    );
}

export default ServerError;
