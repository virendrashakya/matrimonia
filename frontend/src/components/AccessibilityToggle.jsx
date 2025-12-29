import { Button, Dropdown, Space, Switch } from 'antd';
import { FontSizeOutlined, PlusOutlined, MinusOutlined, BgColorsOutlined } from '@ant-design/icons';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * Accessibility controls for elder users
 * - Font size adjustment
 * - High contrast toggle
 */
function AccessibilityToggle() {
    const {
        fontSize,
        setFontSize,
        FONT_SIZES,
        increaseFontSize,
        decreaseFontSize,
        highContrast,
        toggleHighContrast
    } = useAccessibility();
    const { isHindi } = useLanguage();

    const fontSizeItems = Object.entries(FONT_SIZES).map(([key, config]) => ({
        key,
        label: (
            <span style={{ fontSize: config.base }}>
                {isHindi ? config.label : config.labelEn} ({config.base}px)
            </span>
        ),
        onClick: () => setFontSize(key)
    }));

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20
        }}>
            {/* Font Size Controls */}
            <Button
                type="text"
                icon={<MinusOutlined />}
                onClick={decreaseFontSize}
                size="small"
                style={{ color: 'inherit' }}
                title={isHindi ? 'फ़ॉन्ट छोटा करें' : 'Decrease font'}
            />

            <Dropdown menu={{ items: fontSizeItems }} placement="bottom">
                <Button
                    type="text"
                    icon={<FontSizeOutlined />}
                    size="small"
                    style={{ color: 'inherit', fontWeight: 600 }}
                >
                    {isHindi ? FONT_SIZES[fontSize].label : fontSize.toUpperCase()}
                </Button>
            </Dropdown>

            <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={increaseFontSize}
                size="small"
                style={{ color: 'inherit' }}
                title={isHindi ? 'फ़ॉन्ट बड़ा करें' : 'Increase font'}
            />

            {/* High Contrast Toggle */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginLeft: 8,
                paddingLeft: 8,
                borderLeft: '1px solid rgba(255,255,255,0.3)'
            }}>
                <BgColorsOutlined />
                <Switch
                    size="small"
                    checked={highContrast}
                    onChange={toggleHighContrast}
                    title={isHindi ? 'उच्च कंट्रास्ट' : 'High Contrast'}
                />
            </div>
        </div>
    );
}

export default AccessibilityToggle;
