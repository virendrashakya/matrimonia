import { createContext, useContext, useState, useEffect } from 'react';
import { languages, defaultLanguage } from '../i18n';
import api from '../services/api';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        // Get saved language from localStorage first
        const saved = localStorage.getItem('matrimonia_language');
        if (saved && languages[saved]) return saved;

        // Try to detect browser language
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang === 'hi') return 'hi';

        return defaultLanguage;
    });

    const [syncing, setSyncing] = useState(false);

    const t = languages[language]?.translations || languages[defaultLanguage].translations;

    // Sync with user's preference from backend when user logs in
    const syncWithUser = (user) => {
        if (user?.preferredLanguage && languages[user.preferredLanguage]) {
            setLanguage(user.preferredLanguage);
            localStorage.setItem('matrimonia_language', user.preferredLanguage);
        }
    };

    // Change language and save to backend if logged in
    const changeLanguage = async (lang) => {
        if (!languages[lang]) return;

        setLanguage(lang);
        localStorage.setItem('matrimonia_language', lang);

        // Try to save to backend (will fail if not logged in, which is fine)
        try {
            setSyncing(true);
            await api.patch('/auth/me/language', { language: lang });
        } catch (error) {
            // Silently fail - localStorage will still work
            console.log('Could not save language preference to server');
        } finally {
            setSyncing(false);
        }
    };

    const value = {
        language,
        languages,
        t,
        changeLanguage,
        syncWithUser,
        syncing,
        isHindi: language === 'hi',
        isEnglish: language === 'en',
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}

export default LanguageContext;
