import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';

const { Text } = Typography;

function NotFound() {
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
                status="404"
                title={
                    <span style={{ fontFamily: 'Playfair Display, serif', color: 'var(--primary)', fontSize: 36 }}>
                        404
                    </span>
                }
                subTitle={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Text style={{ fontSize: 18, fontWeight: 500 }}>
                            {isHindi ? 'पृष्ठ नहीं मिला' : 'Page Not Found'}
                        </Text>
                        <Text type="secondary">
                            {isHindi
                                ? 'क्षमा करें, आप जिस पृष्ठ पर जाने की कोशिश कर रहे हैं वह मौजूद नहीं है।'
                                : 'Sorry, the page you visited does not exist.'}
                        </Text>
                    </div>
                }
                extra={
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
                }
            />
        </div>
    );
}

export default NotFound;
