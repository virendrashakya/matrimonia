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
    ArrowRightOutlined,
    LockOutlined,
    SearchOutlined,
    CrownOutlined
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
        {
            icon: <LockOutlined style={{ fontSize: 32, color: '#A0153E' }} />,
            title: 'Privacy Control',
            titleHi: 'गोपनीयता नियंत्रण',
            desc: 'Your data stays with you. Share only what you want.',
            descHi: 'आपका डेटा सुरक्षित है। केवल वही साझा करें जो आप चाहते हैं।'
        },
        {
            icon: <SearchOutlined style={{ fontSize: 32, color: '#A0153E' }} />,
            title: 'Smart Search',
            titleHi: 'स्मार्ट खोज',
            desc: 'Find matches that truly align with your values.',
            descHi: 'ऐसे रिश्ते खोजें जो वास्तव में आपके मूल्यों से मेल खाते हों।'
        },
        {
            icon: <CrownOutlined style={{ fontSize: 32, color: '#A0153E' }} />,
            title: 'Premium Templates',
            titleHi: 'प्रीमियम टेम्पलेट्स',
            desc: 'Stand out with exclusive, professionally designed biodata formats.',
            descHi: 'विशेष, पेशेवर रूप से डिज़ाइन किए गए बायोडाटा फॉर्मेट के साथ अलग दिखें।'
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
                    <img src="/logo-new.png" alt="Pehchan" style={{ height: 36, width: 36 }} />
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
                background: 'linear-gradient(rgba(160, 21, 62, 0.85), rgba(122, 15, 46, 0.9)), url("/hero-bg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '80px 20px 100px',
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
                        src="/logo-new.png"
                        alt="Pehchan"
                        style={{ height: 120, width: 120, marginBottom: 24, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}
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
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: 'clamp(18px, 4vw, 24px)',
                        marginBottom: 24,
                        lineHeight: 1.6,
                        fontWeight: 500
                    }}>
                        {t.tagline}
                    </Paragraph>
                    <Paragraph style={{
                        color: '#F4D160',
                        fontSize: 'clamp(14px, 3vw, 18px)',
                        marginBottom: 32,
                        fontWeight: 600
                    }}>
                        {isHi ? 'मिनटों में सुंदर विवाह बायोडाटा बनाएं और शेयर करें।' : 'Create beautiful wedding biodata to share with family in minutes.'}
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
                                styles={{ body: { padding: 24 } }}
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
                                <Text style={{ color: '#4A4A4A', fontSize: 16, lineHeight: 1.6 }}>
                                    {isHi ? feature.descHi : feature.desc}
                                </Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </section>

            {/* Biodata Feature Section */}
            <section style={{
                padding: '60px 20px',
                background: '#FFF8F0',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <Row gutter={[40, 40]} align="middle">
                        <Col xs={24} md={12}>
                            <div style={{
                                position: 'relative',
                                display: 'inline-block',
                                padding: 16,
                                background: 'white',
                                borderRadius: 8,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                            }}>
                                <img
                                    src="/biodata-mockup.png"
                                    alt="Biodata Preview"
                                    style={{ width: '100%', maxWidth: 400, borderRadius: 4 }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: -20,
                                    right: -20,
                                    background: 'white',
                                    padding: 16,
                                    borderRadius: 12,
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                }}>
                                    <Space direction="vertical" align="center">
                                        <div style={{ color: '#2E7D32', fontSize: 24 }}><CheckCircleOutlined /></div>
                                        <Text strong>PDF Ready</Text>
                                    </Space>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={12} style={{ textAlign: 'left' }}>
                            <Title level={2} style={{ marginBottom: 16 }}>
                                {isHi ? 'परफेक्ट बायोडाटा बनाएं' : 'Create the Perfect Biodata'}
                            </Title>
                            <Paragraph style={{ fontSize: 18, color: 'rgba(0,0,0,0.6)', marginBottom: 24 }}>
                                {isHi
                                    ? 'हमारे फ्री टूल्स के साथ पेशेवर दिखने वाला बायोडाटा बनाएं। फोटो जोड़ें, धार्मिक शीर्षक चुनें और आसानी से शेयर करें।'
                                    : 'Build a professional-looking biodata with our free tools. Add photos, choose religious headers, and share with ease.'
                                }
                            </Paragraph>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12, background: '#FCE4EC',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C2185B', fontSize: 24
                                    }}>
                                        <StarOutlined />
                                    </div>
                                    <div>
                                        <Title level={5} style={{ margin: 0 }}>{isHi ? 'सुंदर टेम्पलेट्स' : 'Beautiful Templates'}</Title>
                                        <Text type="secondary">{isHi ? 'गणेश, बुद्ध और अन्य धार्मिक शीर्षकों के साथ' : 'With Ganesh, Buddha & other religious headers'}</Text>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12, background: '#E8F5E9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontSize: 24
                                    }}>
                                        <CheckCircleOutlined />
                                    </div>
                                    <div>
                                        <Title level={5} style={{ margin: 0 }}>{isHi ? 'आसान शेयरिंग' : 'Easy Sharing'}</Title>
                                        <Text type="secondary">{isHi ? 'WhatsApp पर PDF या लिंक भेजें' : 'Send PDF or Link via WhatsApp'}</Text>
                                    </div>
                                </div>
                                <Link to="/register">
                                    <Button type="primary" size="large" style={{ marginTop: 16 }}>
                                        {isHi ? 'अपना बायोडाटा बनाएं' : 'Create Your Biodata'}
                                    </Button>
                                </Link>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Reviews Section */}
            <section style={{ padding: '60px 20px', background: 'white' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
                        {isHi ? 'सफल कहानियां' : 'Success Stories'}
                    </Title>
                    <Row gutter={[24, 24]}>
                        {[
                            {
                                name: 'Sharma Family',
                                location: 'Delhi',
                                text: 'Pehchan made it so easy to create a biodata for my daughter. The templates are beautiful!',
                                textHi: 'मेरी बेटी के लिए बायोडाटा बनाना बहुत आसान हो गया। टेम्पलेट्स बहुत सुंदर हैं!'
                            },
                            {
                                name: 'Rajesh Gupta',
                                location: 'Mumbai',
                                text: 'I shared the PDF on WhatsApp and got compliments on how professional it looked.',
                                textHi: 'मैंने WhatsApp पर PDF शेयर किया और सभी ने कहा कि यह कितना प्रोफेशनल लग रहा है।'
                            },
                            {
                                name: 'Meera Patel',
                                location: 'Ahmedabad',
                                text: 'Finally a simple tool that understands Indian wedding requirements. Highly recommended!',
                                textHi: 'अंत में एक ऐसा टूल जो भारतीय शादी की जरूरतों को समझता है। बहुत अच्छा!'
                            }
                        ].map((review, i) => (
                            <Col xs={24} md={8} key={i}>
                                <Card style={{ height: '100%', borderRadius: 12, border: '1px solid #f0f0f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%', background: '#FFF0F5',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0153E',
                                            marginRight: 12, fontWeight: 'bold'
                                        }}>
                                            {review.name[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{review.name}</div>
                                            <div style={{ fontSize: 12, color: '#999' }}>{review.location}</div>
                                        </div>
                                    </div>
                                    <Text type="secondary" italic>"{isHi ? review.textHi : review.text}"</Text>
                                    <div style={{ marginTop: 12, color: '#FFD700' }}>★★★★★</div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section >

            {/* How It Works */}
            < section style={{
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
            </section >

            {/* CTA Section */}
            < section style={{
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
            </section >

            {/* Footer */}
            < footer style={{
                padding: '24px 20px',
                textAlign: 'center',
                background: '#2C1810',
                color: 'rgba(255,255,255,0.6)',
            }}>
                <Space split={<span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>}>
                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>© 2024 Pehchan</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>{t.tagline}</Text>
                </Space>
            </footer >
        </div >
    );
}

export default Landing;
