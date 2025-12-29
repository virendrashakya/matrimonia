import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

const FONT_SIZES = {
    small: { base: 14, label: 'छोटा', labelEn: 'Small' },
    medium: { base: 16, label: 'मध्यम', labelEn: 'Medium' },
    large: { base: 18, label: 'बड़ा', labelEn: 'Large' },
    xlarge: { base: 20, label: 'बहुत बड़ा', labelEn: 'Extra Large' }
};

export function AccessibilityProvider({ children }) {
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('fontSize') || 'medium';
    });

    const [highContrast, setHighContrast] = useState(() => {
        return localStorage.getItem('highContrast') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize);
        document.documentElement.style.setProperty('--base-font-size', `${FONT_SIZES[fontSize].base}px`);
        document.documentElement.style.fontSize = `${FONT_SIZES[fontSize].base}px`;
    }, [fontSize]);

    useEffect(() => {
        localStorage.setItem('highContrast', highContrast);
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, [highContrast]);

    const increaseFontSize = () => {
        const sizes = Object.keys(FONT_SIZES);
        const currentIndex = sizes.indexOf(fontSize);
        if (currentIndex < sizes.length - 1) {
            setFontSize(sizes[currentIndex + 1]);
        }
    };

    const decreaseFontSize = () => {
        const sizes = Object.keys(FONT_SIZES);
        const currentIndex = sizes.indexOf(fontSize);
        if (currentIndex > 0) {
            setFontSize(sizes[currentIndex - 1]);
        }
    };

    const toggleHighContrast = () => {
        setHighContrast(!highContrast);
    };

    const value = {
        fontSize,
        setFontSize,
        fontSizeConfig: FONT_SIZES[fontSize],
        FONT_SIZES,
        increaseFontSize,
        decreaseFontSize,
        highContrast,
        toggleHighContrast
    };

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
}

export default AccessibilityContext;
