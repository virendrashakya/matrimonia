import { Link } from 'react-router-dom';
import { Button, Typography, Space, Row, Col, Card, Dropdown } from 'antd';
import {
    SafetyCertificateOutlined,
    TeamOutlined,
    HeartOutlined,
    GlobalOutlined,
    CheckCircleOutlined,
    UserOutlined,
    StarOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';

const { Title, Text, Paragraph } = Typography;

function Landing() {
    const { t, language, languages, changeLanguage } = useLanguage();

    const languageMenu = {
        items: Object.entries(languages).map(([code, lang]) => ({
            key: code,
            label: <span>{lang.nativeName} {language === code && '✓'}</span>,
            onClick: () => changeLanguage(code),
        })),
    };

    const features = [
        {
            icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: '#A0153E' }} />,
            title: 'Community Verified',
            titleHi: 'समुदाय सत्यापित',
            desc: 'Profiles verified by trusted community members',
            descHi: 'विश्वसनीय समुदाय सदस्यों द्वारा सत्यापित प्रोफाइल'
        },
        {
            icon: <TeamOutlined style={{ fontSize: 32, color: '#A0153E' }} />,
            title: 'Recognition System',
            titleHi: 'पहचान प्रणाली',
            desc: 'Know how many people recognize each profile',
            descHi: 'जानें कितने लोग प्रत्येक प्रोफाइल को पहचानते हैं'
        },
        {
            icon: <HeartOutlined style={{ fontSize: 32, color: '#A0153E' }} />,
            title: 'Family-First',
            titleHi: 'परिवार प्रथम',
            desc: 'Designed for elders and family involvement',
            descHi: 'बुजुर्गों और परिवार की भागीदारी के लिए डिज़ाइन'
        },
    ];

    const stats = [
        { value: '1000+', label: 'Profiles', labelHi: 'प्रोफाइल' },
        { value: '500+', label: 'Families', labelHi: 'परिवार' },
        { value: '50+', label: 'Matches', labelHi: 'मिलान' },
    ];

    const isHi = language === 'hi';

    return (
        <div style={{ minHeight: '100vh', background: '#FFFBF5' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                position: 'sticky',
                top: 0,
                background: 'rgba(255, 251, 245, 0.95)',
                backdropFilter: 'blur(10px)',
                zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src="/logo.png" alt="Pehchan" style={{ height: 36, width: 36 }} />
                    <span style={{
                        fontSize: 22,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #A0153E, #D4AF37)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        {t.appName}
                    </span>
                </div>
                <Space>
                    <Dropdown menu={languageMenu}>
                        <Button icon={<GlobalOutlined />} size="small">
                            {languages[language]?.nativeName}
                        </Button>
                    </Dropdown>
                    <Link to="/login">
                        <Button type="primary" style={{ borderRadius: 20 }}>
                            {t.auth.login}
                        </Button>
                    </Link>
                </Space>
            </header>

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #A0153E 0%, #7A0F2E 100%)',
                padding: '60px 20px 80px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.1)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: -50,
                    left: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
                    <img
                        src="/logo.png"
                        alt="Pehchan"
                        style={{ height: 100, width: 100, marginBottom: 24 }}
                    />
                    <Title level={1} style={{
                        color: 'white',
                        fontSize: 'clamp(32px, 8vw, 56px)',
                        marginBottom: 8,
                        fontWeight: 800,
                    }}>
                        {t.appName}
                    </Title>
                    <Paragraph style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: 'clamp(16px, 4vw, 22px)',
                        marginBottom: 32,
                    }}>
                        {t.tagline}
                    </Paragraph>

                    <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                        <Link to="/register">
                            <Button
                                type="primary"
                                size="large"
                                icon={<ArrowRightOutlined />}
                                style={{
                                    background: '#D4AF37',
                                    borderColor: '#D4AF37',
                                    color: '#2C1810',
                                    height: 52,
                                    padding: '0 32px',
                                    borderRadius: 26,
                                    fontSize: 16,
                                    fontWeight: 600,
                                }}
                            >
                                {isHi ? 'अभी जुड़ें' : 'Join Now'}
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button
                                size="large"
                                style={{
                                    background: 'transparent',
                                    borderColor: 'white',
                                    color: 'white',
                                    height: 52,
                                    padding: '0 32px',
                                    borderRadius: 26,
                                    fontSize: 16,
                                }}
                            >
                                {t.auth.login}
                            </Button>
                        </Link>
                    </Space>
                </div>
            </section>

            {/* Stats Section */}
            <section style={{
                padding: '0 20px',
                marginTop: -40,
                position: 'relative',
                zIndex: 2,
            }}>
                <Card style={{
                    maxWidth: 600,
                    margin: '0 auto',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}>
                    <Row gutter={16} justify="space-around" align="middle">
                        {stats.map((stat, i) => (
                            <Col key={i} xs={8} style={{ textAlign: 'center' }}>
                                <Text style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 700, color: '#A0153E' }}>
                                    {stat.value}
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {isHi ? stat.labelHi : stat.label}
                                </Text>
                            </Col>
                        ))}
                    </Row>
                </Card>
            </section>

            {/* Features Section */}
            <section style={{ padding: '60px 20px', maxWidth: 1000, margin: '0 auto' }}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
                    {isHi ? 'हम क्यों?' : 'Why Pehchan?'}
                </Title>
                <Row gutter={[24, 24]}>
                    {features.map((feature, i) => (
                        <Col xs={24} md={8} key={i}>
                            <Card
                                style={{
                                    textAlign: 'center',
                                    height: '100%',
                                    borderRadius: 16,
                                    border: '1px solid #F3E8D8',
                                }}
                                bodyStyle={{ padding: 24 }}
                            >
                                <div style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #FFF5EB, #FFE4CC)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                }}>
                                    {feature.icon}
                                </div>
                                <Title level={4} style={{ marginBottom: 8 }}>
                                    {isHi ? feature.titleHi : feature.title}
                                </Title>
                                <Text type="secondary">
                                    {isHi ? feature.descHi : feature.desc}
                                </Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </section>

            {/* How It Works */}
            <section style={{
                background: 'linear-gradient(135deg, #FFF8F0, #FFF5EB)',
                padding: '60px 20px'
            }}>
                <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                    <Title level={2} style={{ marginBottom: 40 }}>
                        {isHi ? 'कैसे काम करता है?' : 'How It Works'}
                    </Title>
                    <Row gutter={[24, 24]}>
                        {[
                            { step: 1, title: 'Register', titleHi: 'पंजीकरण करें', desc: 'Create your account', descHi: 'अपना खाता बनाएं' },
                            { step: 2, title: 'Add Profiles', titleHi: 'प्रोफाइल जोड़ें', desc: 'Add biodata', descHi: 'बायोडाटा जोड़ें' },
                            { step: 3, title: 'Get Recognized', titleHi: 'पहचान पाएं', desc: 'Build trust', descHi: 'विश्वास बनाएं' },
                        ].map((item) => (
                            <Col xs={24} sm={8} key={item.step}>
                                <div style={{
                                    background: '#A0153E',
                                    color: 'white',
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                    fontWeight: 700,
                                    margin: '0 auto 16px',
                                }}>
                                    {item.step}
                                </div>
                                <Title level={4} style={{ marginBottom: 4 }}>
                                    {isHi ? item.titleHi : item.title}
                                </Title>
                                <Text type="secondary">{isHi ? item.descHi : item.desc}</Text>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: '60px 20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #A0153E, #7A0F2E)',
            }}>
                <div style={{ maxWidth: 500, margin: '0 auto' }}>
                    <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
                        {isHi ? 'शुरू करने के लिए तैयार?' : 'Ready to Get Started?'}
                    </Title>
                    <Paragraph style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32 }}>
                        {isHi ? 'हजारों परिवारों से जुड़ें जो पहचान पर भरोसा करते हैं' : 'Join thousands of families who trust Pehchan'}
                    </Paragraph>
                    <Link to="/register">
                        <Button
                            size="large"
                            style={{
                                background: '#D4AF37',
                                borderColor: '#D4AF37',
                                color: '#2C1810',
                                height: 52,
                                padding: '0 48px',
                                borderRadius: 26,
                                fontSize: 16,
                                fontWeight: 600,
                            }}
                        >
                            {isHi ? 'मुफ्त में शामिल हों' : 'Join for Free'}
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '24px 20px',
                textAlign: 'center',
                background: '#2C1810',
                color: 'rgba(255,255,255,0.6)',
            }}>
                <Space split={<span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>© 2024 Pehchan</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{t.tagline}</Text>
                </Space>
            </footer>
        </div>
    );
}

export default Landing;
