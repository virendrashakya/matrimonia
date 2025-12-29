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

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) return saved === 'true';
        return false; // Default to light mode
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

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

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

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const value = {
        fontSize,
        setFontSize,
        fontSizeConfig: FONT_SIZES[fontSize],
        FONT_SIZES,
        increaseFontSize,
        decreaseFontSize,
        highContrast,
        toggleHighContrast,
        darkMode,
        toggleDarkMode
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
        // Return safe defaults if not in provider
        return {
            fontSize: 'medium',
            setFontSize: () => { },
            fontSizeConfig: { base: 16, label: 'मध्यम', labelEn: 'Medium' },
            FONT_SIZES: {},
            increaseFontSize: () => { },
            decreaseFontSize: () => { },
            highContrast: false,
            toggleHighContrast: () => { },
            darkMode: false,
            toggleDarkMode: () => { }
        };
    }
    return context;
}

export default AccessibilityContext;
