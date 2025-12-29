import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, InputNumber, Button, Row, Col, Typography, Divider, Space, Steps, Alert, Checkbox, TimePicker, Progress, Spin, Radio, Tooltip } from 'antd';
import { GlobalOutlined, HeartOutlined, UserOutlined, HomeOutlined, BookOutlined, StarOutlined, ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { useConfig } from '../context/ConfigContext';
import api from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Bilingual input component
function BilingualInput({ name, label, labelHi, placeholder, placeholderHi, required = false, ...inputProps }) {
    return (
        <Row gutter={12}>
            <Col span={12}>
                <Form.Item
                    name={name}
                    label={<span>{label} <Text type="secondary" style={{ fontSize: 10 }}>(EN)</Text></span>}
                    rules={required ? [{ required: true, message: `Required` }] : []}
                >
                    <Input placeholder={placeholder} {...inputProps} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name={['localContent', name]}
                    label={<span>{labelHi} <Text type="secondary" style={{ fontSize: 10 }}>(हिंदी)</Text></span>}
                >
                    <Input placeholder={placeholderHi} {...inputProps} />
                </Form.Item>
            </Col>
        </Row>
    );
}

const STEPS = [
    { title: 'Basic', icon: <UserOutlined /> },
    { title: 'Location', icon: <HomeOutlined /> },
    { title: 'Physical', icon: <UserOutlined /> },
    { title: 'Education', icon: <BookOutlined /> },
    { title: 'Family', icon: <HomeOutlined /> },
    { title: 'Horoscope', icon: <StarOutlined /> },
    { title: 'Preferences', icon: <HeartOutlined /> },
];

function AddProfile() {
    const navigate = useNavigate();
    const { t, isHindi } = useLanguage();
    const { getOptions, loading: configLoading } = useConfig();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();

    // Get options from config (backend-configurable)
    const rashiOptions = getOptions('rashiOptions', isHindi);
    const nakshatraOptions = getOptions('nakshatraOptions', isHindi);
    const stateOptions = getOptions('stateOptions', isHindi);
    const maritalStatusOptions = getOptions('maritalStatusOptions', isHindi);
    const complexionOptions = getOptions('complexionOptions', isHindi);
    const bodyTypeOptions = getOptions('bodyTypeOptions', isHindi);
    const dietOptions = getOptions('dietOptions', isHindi);
    const manglikOptions = getOptions('manglikOptions', isHindi);
    const familyTypeOptions = getOptions('familyTypeOptions', isHindi);

    if (configLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Get ALL form values from all steps
            const values = form.getFieldsValue(true);

            console.log('Form values:', JSON.stringify(values, null, 2));

            if (values.dateOfBirth) {
                values.dateOfBirth = values.dateOfBirth.toISOString();
            }
            if (values.horoscope?.birthTime) {
                values.horoscope.birthTime = values.horoscope.birthTime.format('HH:mm');
            }

            const response = await api.post('/profiles', values);
            toast.success('Profile created successfully!');
            navigate(`/profiles/${response.data.data.profile._id}`);
        } catch (error) {
            console.error('API Error:', error.response?.data);

            // Extract detailed error message from backend
            const errorData = error.response?.data;
            let errorMsg = 'Failed to create profile';

            if (errorData) {
                // Check for validation errors
                if (errorData.details && Array.isArray(errorData.details)) {
                    errorMsg = errorData.details.join(', ');
                } else if (errorData.error) {
                    // Use Hindi error if available and language is Hindi
                    errorMsg = isHindi && errorData.errorHi ? errorData.errorHi : errorData.error;
                } else if (typeof errorData === 'string') {
                    errorMsg = errorData;
                }
            }

            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const next = async () => {
        try {
            // Validate only current step's required fields
            const stepFields = {
                0: ['fullName', 'gender', 'dateOfBirth', 'phone'], // Basic
                1: ['caste', 'city', 'state'], // Location
                2: [], // Physical - optional
                3: ['education', 'profession'], // Education
                4: [], // Family - optional
                5: [], // Horoscope - optional
                6: [], // Preferences - optional
            };

            const fieldsToValidate = stepFields[currentStep] || [];
            if (fieldsToValidate.length > 0) {
                await form.validateFields(fieldsToValidate);
            }
            setCurrentStep(currentStep + 1);
        } catch (error) {
            // Validation failed, stay on current step
            console.log('Validation error:', error);
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const goToStep = (step) => {
        setCurrentStep(step);
    };

    // Step 1: Basic Information
    const BasicStep = () => (
        <Card title={<><UserOutlined /> Basic Information / मूल जानकारी</>}>
            {/* Who is this profile for? */}
            <Form.Item
                name="createdFor"
                label="Creating Profile For / किसके लिए प्रोफ़ाइल बना रहे हैं?"
                rules={[{ required: true, message: 'Please select whom this profile is for' }]}
            >
                <Select placeholder="Select relationship">
                    <Option value="self">👤 Self / स्वयं</Option>
                    <Option value="son">👦 Son / बेटा</Option>
                    <Option value="daughter">👧 Daughter / बेटी</Option>
                    <Option value="brother">👨 Brother / भाई</Option>
                    <Option value="sister">👩 Sister / बहन</Option>
                    <Option value="nephew">👦 Nephew / भतीजा</Option>
                    <Option value="niece">👧 Niece / भतीजी</Option>
                    <Option value="friend">🤝 Friend / मित्र</Option>
                    <Option value="relative">👥 Relative / रिश्तेदार</Option>
                    <Option value="client">📋 Client / ग्राहक</Option>
                </Select>
            </Form.Item>

            <Divider />

            <BilingualInput name="fullName" label="Full Name" labelHi="पूरा नाम" placeholder="Enter full name" placeholderHi="पूरा नाम दर्ज करें" required />

            <Row gutter={24}>
                <Col xs={24} sm={8}>
                    <Form.Item name="gender" label="Gender / लिंग" rules={[{ required: true }]}>
                        <Select>
                            <Option value="male">Male / पुरुष</Option>
                            <Option value="female">Female / महिला</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name="dateOfBirth" label="Date of Birth / जन्म तिथि" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name="maritalStatus" label="Marital Status / वैवाहिक स्थिति">
                        <Select>
                            <Option value="never_married">Never Married / अविवाहित</Option>
                            <Option value="divorced">Divorced / तलाकशुदा</Option>
                            <Option value="widowed">Widowed / विधवा/विधुर</Option>
                            <Option value="awaiting_divorce">Awaiting Divorce</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <Form.Item name="phone" label="Phone / फ़ोन" rules={[{ required: true }]}>
                        <Input placeholder="Enter phone number" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="email" label="Email / ईमेल">
                        <Input placeholder="Enter email (optional)" />
                    </Form.Item>
                </Col>
            </Row>

            {/* Visibility Control */}
            <Divider>Profile Visibility / प्रोफ़ाइल दृश्यता</Divider>
            <Form.Item
                name="visibility"
                label={<span><LockOutlined /> Who can view this profile?</span>}
            >
                <Radio.Group style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Radio value="public" style={{ padding: '8px 12px', background: '#f6ffed', borderRadius: 8, width: '100%' }}>
                            <Space>
                                <GlobalOutlined style={{ color: '#52c41a' }} />
                                <div>
                                    <strong>Public / सार्वजनिक</strong>
                                    <div style={{ fontSize: 12, color: '#666' }}>
                                        Everyone can see full profile
                                    </div>
                                </div>
                            </Space>
                        </Radio>
                        <Radio value="restricted" style={{ padding: '8px 12px', background: '#fff7e6', borderRadius: 8, width: '100%' }}>
                            <Space>
                                <EyeOutlined style={{ color: '#fa8c16' }} />
                                <div>
                                    <strong>Restricted / प्रतिबंधित</strong>
                                    <div style={{ fontSize: 12, color: '#666' }}>
                                        Preview visible, full access requires approval
                                    </div>
                                </div>
                            </Space>
                        </Radio>
                        <Radio value="private" style={{ padding: '8px 12px', background: '#fff1f0', borderRadius: 8, width: '100%' }}>
                            <Space>
                                <EyeInvisibleOutlined style={{ color: '#ff4d4f' }} />
                                <div>
                                    <strong>Private / निजी</strong>
                                    <div style={{ fontSize: 12, color: '#666' }}>
                                        Hidden from search, only you can see
                                    </div>
                                </div>
                            </Space>
                        </Radio>
                    </Space>
                </Radio.Group>
            </Form.Item>
        </Card>
    );

    // Step 2: Location & Demographics
    const LocationStep = () => (
        <Card title={<><HomeOutlined /> Location & Demographics / स्थान और जनसांख्यिकी</>}>
            <BilingualInput name="caste" label="Caste" labelHi="जाति" placeholder="Enter caste" placeholderHi="जाति दर्ज करें" required />

            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <BilingualInput name="subCaste" label="Sub-Caste" labelHi="उपजाति" placeholder="Sub-caste" placeholderHi="उपजाति" />
                </Col>
                <Col xs={24} sm={12}>
                    <BilingualInput name="gotra" label="Gotra" labelHi="गोत्र" placeholder="Gotra" placeholderHi="गोत्र" />
                </Col>
            </Row>

            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <Form.Item name="religion" label="Religion / धर्म">
                        <Select defaultValue="Hindu">
                            <Option value="Hindu">Hindu / हिन्दू</Option>
                            <Option value="Muslim">Muslim / मुस्लिम</Option>
                            <Option value="Christian">Christian / ईसाई</Option>
                            <Option value="Sikh">Sikh / सिख</Option>
                            <Option value="Jain">Jain / जैन</Option>
                            <Option value="Buddhist">Buddhist / बौद्ध</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="motherTongue" label="Mother Tongue / मातृभाषा">
                        <Select showSearch placeholder="Select">
                            {['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi', 'Bhojpuri', 'Rajasthani'].map(l => (
                                <Option key={l} value={l}>{l}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider>Location / स्थान</Divider>
            <BilingualInput name="city" label="City" labelHi="शहर" placeholder="City" placeholderHi="शहर" required />

            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <Form.Item name="state" label="State / राज्य" rules={[{ required: true }]}>
                        <Select showSearch placeholder="Select state">
                            {stateOptions.map(opt => (
                                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <BilingualInput name="nativePlace" label="Native Place" labelHi="मूल स्थान" placeholder="Native place" placeholderHi="मूल स्थान" />
                </Col>
            </Row>
        </Card>
    );

    // Step 3: Physical & Lifestyle
    const PhysicalStep = () => (
        <Card title={<><UserOutlined /> Physical & Lifestyle / शारीरिक और जीवनशैली</>}>
            <Row gutter={24}>
                <Col xs={12} sm={6}>
                    <Form.Item name="heightCm" label="Height (cm)">
                        <InputNumber min={100} max={250} style={{ width: '100%' }} placeholder="170" />
                    </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                    <Form.Item name="weightKg" label="Weight (kg)">
                        <InputNumber min={30} max={200} style={{ width: '100%' }} placeholder="65" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={6}>
                    <Form.Item name="complexion" label="Complexion / रंग">
                        <Select placeholder="Select">
                            <Option value="very_fair">Very Fair / बहुत गोरा</Option>
                            <Option value="fair">Fair / गोरा</Option>
                            <Option value="wheatish">Wheatish / गेहुंआ</Option>
                            <Option value="wheatish_brown">Wheatish Brown</Option>
                            <Option value="dark">Dark / सांवला</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={6}>
                    <Form.Item name="bodyType" label="Body Type">
                        <Select placeholder="Select">
                            <Option value="slim">Slim / पतला</Option>
                            <Option value="average">Average / सामान्य</Option>
                            <Option value="athletic">Athletic</Option>
                            <Option value="heavy">Heavy / भारी</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider>Lifestyle / जीवनशैली</Divider>
            <Row gutter={24}>
                <Col xs={24} sm={8}>
                    <Form.Item name="diet" label="Diet / आहार">
                        <Select>
                            <Option value="vegetarian">Vegetarian / शाकाहारी</Option>
                            <Option value="non_vegetarian">Non-Veg / मांसाहारी</Option>
                            <Option value="eggetarian">Eggetarian / अंडाहारी</Option>
                            <Option value="jain">Jain / जैन</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name="smoking" label="Smoking / धूम्रपान">
                        <Select>
                            <Option value="no">No / नहीं</Option>
                            <Option value="occasionally">Occasionally / कभी-कभी</Option>
                            <Option value="yes">Yes / हाँ</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name="drinking" label="Drinking / शराब">
                        <Select>
                            <Option value="no">No / नहीं</Option>
                            <Option value="occasionally">Occasionally / कभी-कभी</Option>
                            <Option value="yes">Yes / हाँ</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <Form.Item name="hobbies" label="Hobbies / शौक">
                        <Select mode="tags" placeholder="Add hobbies">
                            {['Reading', 'Music', 'Sports', 'Cooking', 'Travel', 'Photography', 'Movies', 'Yoga'].map(h => (
                                <Option key={h} value={h}>{h}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="languages" label="Languages Known">
                        <Select mode="multiple" placeholder="Select languages">
                            {['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi'].map(l => (
                                <Option key={l} value={l}>{l}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="aboutMe" label="About Me / मेरे बारे में">
                <TextArea rows={3} placeholder="Write about yourself..." maxLength={1000} showCount />
            </Form.Item>
        </Card>
    );

    // Step 4: Education & Career
    const EducationStep = () => (
        <Card title={<><BookOutlined /> Education & Career / शिक्षा और करियर</>}>
            <BilingualInput name="education" label="Education" labelHi="शिक्षा" placeholder="e.g., B.Tech, MBA" placeholderHi="जैसे बी.टेक, एम.बी.ए" required />
            <BilingualInput name="profession" label="Profession" labelHi="पेशा" placeholder="e.g., Software Engineer" placeholderHi="जैसे सॉफ्टवेयर इंजीनियर" required />

            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <BilingualInput name="company" label="Company" labelHi="कंपनी" placeholder="Company name" placeholderHi="कंपनी का नाम" />
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="annualIncome" label="Annual Income / वार्षिक आय">
                        <Select placeholder="Select range">
                            {['0-3 LPA', '3-5 LPA', '5-7.5 LPA', '7.5-10 LPA', '10-15 LPA', '15-20 LPA', '20-30 LPA', '30-50 LPA', '50+ LPA', 'Not Disclosed'].map(i => (
                                <Option key={i} value={i}>{i}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
        </Card>
    );

    // Step 5: Family Details
    const FamilyStep = () => (
        <Card title={<><HomeOutlined /> Family Details / पारिवारिक विवरण</>}>
            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <BilingualInput name="fatherName" label="Father's Name" labelHi="पिता का नाम" placeholder="Father's name" placeholderHi="पिता का नाम" />
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="fatherStatus" label="Father's Status">
                        <Select placeholder="Select">
                            <Option value="employed">Employed / नौकरी</Option>
                            <Option value="business">Business / व्यापार</Option>
                            <Option value="retired">Retired / सेवानिवृत्त</Option>
                            <Option value="passed_away">Passed Away / स्वर्गवासी</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <BilingualInput name="motherName" label="Mother's Name" labelHi="माता का नाम" placeholder="Mother's name" placeholderHi="माता का नाम" />
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name="motherStatus" label="Mother's Status">
                        <Select placeholder="Select">
                            <Option value="homemaker">Homemaker / गृहिणी</Option>
                            <Option value="employed">Employed / नौकरी</Option>
                            <Option value="business">Business / व्यापार</Option>
                            <Option value="passed_away">Passed Away / स्वर्गवासी</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col xs={12} sm={6}>
                    <Form.Item name="brothersCount" label="Brothers / भाई">
                        <InputNumber min={0} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                    <Form.Item name="brothersMarried" label="Married">
                        <InputNumber min={0} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                    <Form.Item name="sistersCount" label="Sisters / बहन">
                        <InputNumber min={0} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                    <Form.Item name="sistersMarried" label="Married">
                        <InputNumber min={0} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col xs={24} sm={8}>
                    <Form.Item name="familyType" label="Family Type">
                        <Select>
                            <Option value="nuclear">Nuclear / एकल</Option>
                            <Option value="joint">Joint / संयुक्त</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name="familyStatus" label="Family Status">
                        <Select placeholder="Select">
                            <Option value="middle_class">Middle Class</Option>
                            <Option value="upper_middle_class">Upper Middle Class</Option>
                            <Option value="rich">Rich / धनी</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name="familyValues" label="Family Values">
                        <Select placeholder="Select">
                            <Option value="traditional">Traditional / पारंपरिक</Option>
                            <Option value="moderate">Moderate / मध्यम</Option>
                            <Option value="liberal">Liberal / उदार</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
        </Card>
    );

    // Step 6: Horoscope (Optional)
    const HoroscopeStep = () => (
        <Card title={<><StarOutlined /> Horoscope / कुंडली (Optional)</>}>
            <Alert message="These fields are optional. Fill if horoscope matching is important for you." type="info" showIcon style={{ marginBottom: 16 }} />

            <Row gutter={24}>
                <Col xs={24} sm={8}>
                    <Form.Item name={['horoscope', 'rashi']} label="Rashi / राशि">
                        <Select placeholder="Select Rashi" allowClear>
                            {rashiOptions.map(opt => (
                                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name={['horoscope', 'nakshatra']} label="Nakshatra / नक्षत्र">
                        <Select placeholder="Select" allowClear showSearch>
                            {nakshatraOptions.map(opt => (
                                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name={['horoscope', 'manglikStatus']} label="Manglik / मांगलिक">
                        <Select placeholder="Select" allowClear>
                            <Option value="manglik">Manglik / मांगलिक</Option>
                            <Option value="non_manglik">Non-Manglik / अमांगलिक</Option>
                            <Option value="anshik_manglik">Anshik Manglik</Option>
                            <Option value="dont_know">Don't Know / पता नहीं</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <Form.Item name={['horoscope', 'birthTime']} label="Birth Time / जन्म समय">
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name={['horoscope', 'birthPlace']} label="Birth Place / जन्म स्थान">
                        <Input placeholder="Enter birth place" />
                    </Form.Item>
                </Col>
            </Row>
        </Card>
    );

    // Step 7: Partner Preferences
    const PreferencesStep = () => (
        <Card title={<><HeartOutlined /> Partner Preferences / जीवनसाथी की पसंद</>}>
            <Alert message="These preferences help us find better matches for you" type="info" showIcon style={{ marginBottom: 16 }} />

            <Text strong>Age & Physical</Text>
            <Row gutter={24} style={{ marginTop: 12 }}>
                <Col xs={12} sm={6}>
                    <Form.Item name={['preferences', 'ageMin']} label="Age Min">
                        <InputNumber min={18} max={70} style={{ width: '100%' }} placeholder="18" />
                    </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                    <Form.Item name={['preferences', 'ageMax']} label="Age Max">
                        <InputNumber min={18} max={70} style={{ width: '100%' }} placeholder="35" />
                    </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                    <Form.Item name={['preferences', 'heightMin']} label="Height Min (cm)">
                        <InputNumber min={100} max={250} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                    <Form.Item name={['preferences', 'heightMax']} label="Height Max (cm)">
                        <InputNumber min={100} max={250} style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider />
            <Text strong>Background</Text>
            <Row gutter={24} style={{ marginTop: 12 }}>
                <Col xs={24} sm={12}>
                    <Form.Item name={['preferences', 'maritalStatus']} label="Marital Status">
                        <Select mode="multiple" placeholder="Any">
                            <Option value="never_married">Never Married</Option>
                            <Option value="divorced">Divorced</Option>
                            <Option value="widowed">Widowed</Option>
                            <Option value="any">Any</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name={['preferences', 'caste']} label="Caste">
                        <Select mode="tags" placeholder="Enter castes or leave empty for any" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <Form.Item name={['preferences', 'motherTongue']} label="Mother Tongue">
                        <Select mode="multiple" placeholder="Any">
                            {['Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi'].map(l => (
                                <Option key={l} value={l}>{l}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name={['preferences', 'state']} label="State">
                        <Select mode="multiple" placeholder="Any state" showSearch>
                            {stateOptions.map(opt => (
                                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Divider />
            <Text strong>Lifestyle</Text>
            <Row gutter={24} style={{ marginTop: 12 }}>
                <Col xs={24} sm={8}>
                    <Form.Item name={['preferences', 'diet']} label="Diet">
                        <Select mode="multiple" placeholder="Any">
                            <Option value="vegetarian">Vegetarian</Option>
                            <Option value="non_vegetarian">Non-Veg</Option>
                            <Option value="any">Any</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name={['preferences', 'smoking']} label="Smoking">
                        <Select mode="multiple" placeholder="Any">
                            <Option value="no">No</Option>
                            <Option value="any">Any</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name={['preferences', 'drinking']} label="Drinking">
                        <Select mode="multiple" placeholder="Any">
                            <Option value="no">No</Option>
                            <Option value="any">Any</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col xs={24} sm={12}>
                    <Form.Item name={['preferences', 'manglikStatus']} label="Manglik Status">
                        <Select mode="multiple" placeholder="Any">
                            <Option value="manglik">Manglik</Option>
                            <Option value="non_manglik">Non-Manglik</Option>
                            <Option value="any">Doesn't Matter</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item name={['preferences', 'rashiCompatibility']} valuePropName="checked">
                        <Checkbox>Rashi compatibility important / राशि मेल महत्वपूर्ण</Checkbox>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name={['preferences', 'aboutPartner']} label="About Preferred Partner">
                <TextArea rows={3} placeholder="Describe your ideal partner..." maxLength={500} showCount />
            </Form.Item>
        </Card>
    );

    const steps = [BasicStep, LocationStep, PhysicalStep, EducationStep, FamilyStep, HoroscopeStep, PreferencesStep];
    const CurrentStepComponent = steps[currentStep];

    return (
        <div style={{ padding: '24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Add New Profile</Title>
                <Alert
                    message={<><GlobalOutlined /> English + हिंदी</>}
                    type="info"
                    showIcon={false}
                    style={{ padding: '4px 12px' }}
                />
            </div>

            {/* Progress Bar */}
            <Progress
                percent={Math.round(((currentStep + 1) / STEPS.length) * 100)}
                showInfo={false}
                strokeColor="#A0153E"
                style={{ marginBottom: 16 }}
            />

            {/* Current Step Indicator (Mobile friendly) */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                marginBottom: 24,
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #FFF8F0, #FFFBF5)',
                borderRadius: 12
            }}>
                {STEPS[currentStep].icon}
                <Text strong style={{ fontSize: 16, color: '#A0153E' }}>
                    {currentStep + 1}. {STEPS[currentStep].title}
                </Text>
                <Text type="secondary">({currentStep + 1}/{STEPS.length})</Text>
            </div>

            {/* Step Dots Navigation */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 24
            }}>
                {STEPS.map((step, index) => (
                    <div
                        key={step.title}
                        onClick={() => goToStep(index)}
                        style={{
                            width: index === currentStep ? 24 : 12,
                            height: 12,
                            borderRadius: 6,
                            background: index === currentStep
                                ? 'linear-gradient(135deg, #A0153E, #7A0F2E)'
                                : index < currentStep
                                    ? '#D4AF37'
                                    : '#E5D4C0',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        title={step.title}
                    />
                ))}
            </div>

            {/* Form */}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    gender: 'male',
                    maritalStatus: 'never_married',
                    familyType: 'nuclear',
                    diet: 'vegetarian',
                    smoking: 'no',
                    drinking: 'no',
                    visibility: 'public',
                }}
            >
                <CurrentStepComponent />

                {/* Navigation Buttons */}
                <Card style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={prev}
                            disabled={currentStep === 0}
                        >
                            Previous
                        </Button>

                        <Space>
                            <Text type="secondary">Step {currentStep + 1} of {STEPS.length}</Text>
                        </Space>

                        {currentStep < STEPS.length - 1 ? (
                            <Button type="primary" onClick={next} icon={<ArrowRightOutlined />}>
                                Next
                            </Button>
                        ) : (
                            <Button type="primary" onClick={handleSubmit} loading={loading} icon={<CheckOutlined />}>
                                Create Profile
                            </Button>
                        )}
                    </div>
                </Card>
            </Form>
        </div>
    );
}

export default AddProfile;
