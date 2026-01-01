import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, InputNumber, Button, Row, Col, Typography, Divider, Space, Steps, Alert, Checkbox, TimePicker, Progress, Spin, Radio, Tooltip } from 'antd';
import { GlobalOutlined, HeartOutlined, UserOutlined, HomeOutlined, BookOutlined, StarOutlined, ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { useConfig } from '../context/ConfigContext';
import api from '../services/api';

import { INDIAN_LOCATIONS } from '../constants/locations';
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
    { title: 'The Basics', icon: <UserOutlined />, subtitle: 'Bride/Groom Info' },
    { title: 'Location', icon: <HomeOutlined />, subtitle: 'Residence' },
    { title: 'Physical', icon: <UserOutlined />, subtitle: 'Appearance' },
    { title: 'Education', icon: <BookOutlined />, subtitle: 'Career & Studies' },
    { title: 'Family', icon: <HomeOutlined />, subtitle: 'Background' },
    { title: 'Horoscope', icon: <StarOutlined />, subtitle: 'Kundli Info' },
    { title: 'Preferences', icon: <HeartOutlined />, subtitle: 'Partner Choice' },
];

/**
 * Step Components moved outside to fix "instance created by useForm is not connected" 
 * and to prevent unnecessary re-renders.
 */

const BasicStep = () => (
    <Card title={<><UserOutlined /> Basic Information / मूल जानकारी</>}>
        <Alert message="This information is the core of your biodata." type="success" showIcon style={{ marginBottom: 16, border: 'none', background: '#f6ffed' }} />
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

        <BilingualInput name="fullName" label="Full Name" labelHi="पूरा नाम" placeholder="Enter full name" placeholderHi="पूरा नाम दर्ज करें" required />

        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <Form.Item name="gender" label="Gender / लिंग" rules={[{ required: true }]}>
                    <Radio.Group buttonStyle="solid">
                        <Radio.Button value="male">Male / पुरुष</Radio.Button>
                        <Radio.Button value="female">Female / महिला</Radio.Button>
                    </Radio.Group>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item name="dateOfBirth" label="Date of Birth / जन्म तिथि" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <Form.Item name="maritalStatus" label="Marital Status / वैवाहिक स्थिति">
                    <Select placeholder="Select">
                        <Option value="never_married">Never Married / कुंवारा-कुंवारी</Option>
                        <Option value="widowed">Widowed / विधुर-विधवा</Option>
                        <Option value="divorced">Divorced / तलाकशुदा</Option>
                        <Option value="awaiting_divorce">Awaiting Divorce</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item
                    name="phone"
                    label="Phone / फ़ोन"
                    rules={[
                        { required: true, message: 'Please enter phone number' },
                        { pattern: /^[6-9]\d{9}$/, message: 'Please enter a valid 10-digit Indian mobile number' }
                    ]}
                >
                    <Space.Compact style={{ width: '100%' }}>
                        <Input style={{ width: '20%', textAlign: 'center' }} value="+91" disabled />
                        <Input
                            placeholder="Mobile Number"
                            maxLength={10}
                            style={{ width: '80%' }}
                            onKeyPress={(event) => {
                                if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault();
                                }
                            }}
                        />
                    </Space.Compact>
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <Form.Item name="email" label="Email / ईमेल">
                    <Input placeholder="Optional" />
                </Form.Item>
            </Col>
        </Row>
    </Card>
);

const LocationStep = ({ selectedState, cityOptions }) => (
    <Card title={<><HomeOutlined /> Location & Demographics / स्थान और जनसांख्यिकी</>}>
        <Alert message="Helps us find matches in your city and community." type="info" showIcon style={{ marginBottom: 16 }} />
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
                <Form.Item name="religion" label="Religion / धर्म" initialValue="Hindu">
                    <Select>
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

        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <Form.Item name="state" label="State / राज्य" rules={[{ required: true, message: 'Select State' }]}>
                    <Select showSearch placeholder="Select state">
                        {Object.keys(INDIAN_LOCATIONS).sort().map(s => (
                            <Option key={s} value={s}>{s}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item name="city" label="City / शहर" rules={[{ required: true, message: 'Select City' }]}>
                    <Select
                        showSearch
                        placeholder={selectedState ? "Select city" : "Select state first"}
                        disabled={!selectedState}
                    >
                        {cityOptions.sort().map(c => (
                            <Option key={c} value={c}>{c}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <BilingualInput name="nativePlace" label="Native Place" labelHi="मूल स्थान" placeholder="Native place" placeholderHi="मूल स्थान" />
            </Col>
        </Row>
    </Card>
);

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
                        <Option value="average">Average / औसत</Option>
                        <Option value="athletic">Athletic / एथलेटिक</Option>
                        <Option value="heavy">Heavy / भारी</Option>
                    </Select>
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={24}>
            <Col xs={24} sm={8}>
                <Form.Item name="diet" label="Diet / आहार">
                    <Select placeholder="Select">
                        <Option value="vegetarian">Vegetarian / शाकाहारी</Option>
                        <Option value="non_vegetarian">Non-Vegetarian / मांसाहारी</Option>
                        <Option value="eggetarian">Eggetarian / अंडा खाने वाला</Option>
                        <Option value="jain">Jain / जैन</Option>
                        <Option value="vegan">Vegan / वीगन</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item name="smoking" label="Smoking / धूम्रपान">
                    <Select placeholder="Select">
                        <Option value="no">No / नहीं</Option>
                        <Option value="occasionally">Occasionally / कभी-कभार</Option>
                        <Option value="yes">Yes / हाँ</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item name="drinking" label="Drinking / शराब">
                    <Select placeholder="Select">
                        <Option value="no">No / नहीं</Option>
                        <Option value="occasionally">Occasionally / कभी-कभार</Option>
                        <Option value="yes">Yes / हाँ</Option>
                    </Select>
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={24}>
            <Col xs={24}>
                <Form.Item name="hobbies" label="Hobbies / शौक">
                    <Select mode="tags" placeholder="Add hobbies and press enter" style={{ width: '100%' }}>
                        {['Reading', 'Travel', 'Music', 'Cooking', 'Photography', 'Trekking', 'Painting', 'Fitness'].map(h => (
                            <Option key={h} value={h}>{h}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24}>
                <Form.Item name="languages" label="Languages Known">
                    <Select mode="multiple" placeholder="Select languages" style={{ width: '100%' }}>
                        {['Hindi', 'English', 'Marathi', 'Bengali', 'Tamil', 'Telugu'].map(l => (
                            <Option key={l} value={l}>{l}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
        </Row>
        <Form.Item name="aboutMe" label="About Me / मेरे बारे में">
            <TextArea rows={4} placeholder="Tell us more about yourself, your nature, family values..." maxLength={1000} showCount />
        </Form.Item>
    </Card>
);

const EducationStep = () => (
    <Card title={<><BookOutlined /> Education & Career / शिक्षा और करियर</>}>
        <Alert message="Education and career are key match factors." type="info" showIcon style={{ marginBottom: 16 }} />
        <BilingualInput name="education" label="Highest Education" labelHi="उच्चतम शिक्षा" placeholder="e.g. B.Tech, MBA" placeholderHi="जैसे बी.टेक, एम.बी.ए" required />
        <BilingualInput name="profession" label="Profession / Job" labelHi="व्यवसाय" placeholder="e.g. Software Engineer" placeholderHi="जैसे सॉफ्टवेयर इंजीनियर" required />

        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <Form.Item name="annualIncome" label="Annual Income / वार्षिक आय">
                    <Select placeholder="Select">
                        <Option value="Below 2L">Below 2 Lakhs</Option>
                        <Option value="2L-5L">2L - 5L</Option>
                        <Option value="5L-10L">5L - 10L</Option>
                        <Option value="10L-20L">10L - 20L</Option>
                        <Option value="20L-50L">20L - 50L</Option>
                        <Option value="Above 50L">Above 50L</Option>
                    </Select>
                </Form.Item>
            </Col>
        </Row>

        <BilingualInput name="workCity" label="Work City" labelHi="कार्य करने का शहर" placeholder="City where working" placeholderHi="कार्यस्थल" />
    </Card>
);

const FamilyStep = () => (
    <Card title={<><HomeOutlined /> Family Details / पारिवारिक विवरण</>}>
        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <BilingualInput name="fatherName" label="Father's Name" labelHi="पिता का नाम" placeholder="Father's name" />
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item name="fatherStatus" label="Father's Status">
                    <Select placeholder="Select">
                        <Option value="employed">Employed / कार्यरत</Option>
                        <Option value="retired">Retired / सेवानिवृत्त</Option>
                        <Option value="business">Business / व्यवसाय</Option>
                        <Option value="farmer">Farmer / किसान</Option>
                        <Option value="not_alive">Not Alive / दिवंगत</Option>
                    </Select>
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <BilingualInput name="motherName" label="Mother's Name" labelHi="माता का नाम" placeholder="Mother's name" />
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item name="motherStatus" label="Mother's Status">
                    <Select placeholder="Select">
                        <Option value="homemaker">Homemaker / गृहणी</Option>
                        <Option value="employed">Employed / कार्यरत</Option>
                        <Option value="retired">Retired / सेवानिवृत्त</Option>
                        <Option value="business">Business / व्यवसाय</Option>
                        <Option value="not_alive">Not Alive / दिवंगत</Option>
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
                    <Radio.Group>
                        <Radio value="nuclear">Nuclear</Radio>
                        <Radio value="joint">Joint</Radio>
                    </Radio.Group>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item name="familyStatus" label="Family Status">
                    <Select placeholder="Select">
                        <Option value="middle_class">Middle Class</Option>
                        <Option value="upper_middle">Upper Middle</Option>
                        <Option value="rich">Rich</Option>
                        <Option value="affluent">Affluent</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item name="familyValues" label="Family Values">
                    <Select placeholder="Select">
                        <Option value="traditional">Traditional</Option>
                        <Option value="moderate">Moderate</Option>
                        <Option value="liberal">Liberal</Option>
                    </Select>
                </Form.Item>
            </Col>
        </Row>
    </Card>
);

const HoroscopeStep = ({ rashiOptions, nakshatraOptions }) => (
    <Card title={<><StarOutlined /> Horoscope / कुंडली (Optional)</>}>
        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <Form.Item name={['horoscope', 'rashi']} label="Rashi / राशि">
                    <Select showSearch placeholder="Select Rashi">
                        {rashiOptions.map(r => (
                            <Option key={r.value} value={r.value}>{r.label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item name={['horoscope', 'nakshatra']} label="Nakshatra / नक्षत्र">
                    <Select showSearch placeholder="Select Nakshatra">
                        {nakshatraOptions.map(n => (
                            <Option key={n.value} value={n.value}>{n.label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={24}>
            <Col xs={24} sm={8}>
                <Form.Item name={['horoscope', 'manglikStatus']} label="Manglik / मांगलिक">
                    <Select placeholder="Select">
                        <Option value="manglik">Manglik</Option>
                        <Option value="non_manglik">Non-Manglik</Option>
                        <Option value="asnhik_manglik">Anshik Manglik</Option>
                        <Option value="unknown">Unknown</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
                <Form.Item name={['horoscope', 'birthTime']} label="Birth Time / जन्म समय">
                    <TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
                <Form.Item name={['horoscope', 'birthPlace']} label="Birth Place / जन्म स्थान">
                    <Input placeholder="City name" />
                </Form.Item>
            </Col>
        </Row>
    </Card>
);

const PreferencesStep = ({ maritalStatusOptions, stateOptions }) => (
    <Card title={<><HeartOutlined /> Partner Preferences / जीवनसाथी की पसंद</>}>
        <Row gutter={24}>
            <Col xs={12} sm={6}>
                <Form.Item name={['preferences', 'ageMin']} label="Age Min">
                    <InputNumber min={18} max={70} style={{ width: '100%' }} />
                </Form.Item>
            </Col>
            <Col xs={12} sm={6}>
                <Form.Item name={['preferences', 'ageMax']} label="Age Max">
                    <InputNumber min={18} max={70} style={{ width: '100%' }} />
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

        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <Form.Item name={['preferences', 'maritalStatus']} label="Marital Status">
                    <Select mode="multiple" placeholder="Any">
                        {maritalStatusOptions.map(o => (
                            <Option key={o.value} value={o.value}>{o.label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item name={['preferences', 'caste']} label="Caste">
                    <Select mode="tags" placeholder="Enter castes or 'All'" />
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={24}>
            <Col xs={24} sm={12}>
                <Form.Item name={['preferences', 'motherTongue']} label="Mother Tongue">
                    <Select mode="multiple" placeholder="Any">
                        {['Hindi', 'English', 'Punjabi', 'Marathi', 'Gujarati'].map(l => (
                            <Option key={l} value={l}>{l}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
                <Form.Item name={['preferences', 'state']} label="State">
                    <Select mode="multiple" placeholder="Any">
                        {stateOptions.map(s => (
                            <Option key={s.value} value={s.value}>{s.label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={24}>
            <Col xs={24} sm={8}>
                <Form.Item name={['preferences', 'diet']} label="Diet">
                    <Select mode="multiple" placeholder="Any">
                        <Option value="vegetarian">Vegetarian</Option>
                        <Option value="non_vegetarian">Non-Vegetarian</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item name={['preferences', 'smoking']} label="Smoking">
                    <Select mode="multiple" placeholder="Any">
                        <Option value="no">Non-Smoker</Option>
                        <Option value="occasionally">Doesn't Matter</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
                <Form.Item name={['preferences', 'drinking']} label="Drinking">
                    <Select mode="multiple" placeholder="Any">
                        <Option value="no">Non-Drinker</Option>
                        <Option value="occasionally">Doesn't Matter</Option>
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

function AddProfile() {
    const navigate = useNavigate();
    const { t, isHindi } = useLanguage();
    const { getOptions, loading: configLoading } = useConfig();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();

    // Watch state change to update cities
    const selectedState = Form.useWatch('state', form);
    const [cityOptions, setCityOptions] = useState([]);

    // Update cities when state changes
    useEffect(() => {
        if (selectedState && INDIAN_LOCATIONS[selectedState]) {
            setCityOptions(INDIAN_LOCATIONS[selectedState]);
            // If current city is not in new list, clear it
            const currentCity = form.getFieldValue('city');
            if (currentCity && !INDIAN_LOCATIONS[selectedState].includes(currentCity)) {
                form.setFieldsValue({ city: undefined });
            }
        } else {
            setCityOptions([]);
        }
    }, [selectedState, form]);

    // Get options from config (backend-configurable)
    const rashiOptions = getOptions('rashiOptions', isHindi);
    const nakshatraOptions = getOptions('nakshatraOptions', isHindi);
    const stateOptions = getOptions('stateOptions', isHindi);
    const maritalStatusOptions = getOptions('maritalStatusOptions', isHindi);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();

            console.log('Form values:', JSON.stringify(values, null, 2));

            if (values.dateOfBirth) {
                values.dateOfBirth = values.dateOfBirth.toISOString();
            }
            if (values.horoscope?.birthTime) {
                values.horoscope.birthTime = values.horoscope.birthTime.format('HH:mm');
            }

            const response = await api.post('/profiles', values);
            toast.success('Profile created successfully!');
            navigate(`/profiles/${response.data.data.profile._id}`, { state: { newProfile: true } });
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
                0: ['fullName', 'gender', 'dateOfBirth', 'phone', 'createdFor'], // Basic
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

    // Correctly determining which component to render
    const renderStep = () => {
        switch (currentStep) {
            case 0: return <BasicStep />;
            case 1: return <LocationStep selectedState={selectedState} cityOptions={cityOptions} />;
            case 2: return <PhysicalStep />;
            case 3: return <EducationStep />;
            case 4: return <FamilyStep />;
            case 5: return <HoroscopeStep rashiOptions={rashiOptions} nakshatraOptions={nakshatraOptions} />;
            case 6: return <PreferencesStep stateOptions={stateOptions} maritalStatusOptions={maritalStatusOptions} />;
            default: return null;
        }
    };

    if (configLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#A0153E' }}>
                        Create Wedding Biodata
                    </Title>
                    <Text type="secondary">Follow the steps to build a detailed matrimony profile</Text>
                </div>
            </div>

            {/* Steps Progress */}
            <div style={{ background: '#fff', padding: 20, borderRadius: 16, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Steps
                    current={currentStep}
                    onChange={goToStep}
                    size="small"
                    items={STEPS.map(item => ({
                        title: item.title,
                        icon: item.icon
                    }))}
                    responsive={false} // Prevents it from becoming a list on small screens which looks bad here
                />
            </div>

            {/* Mobile Title */}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
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
                {renderStep()}

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
