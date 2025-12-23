import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ConfigContext = createContext();

export function useConfig() {
    return useContext(ConfigContext);
}

export function ConfigProvider({ children }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await api.get('/config');
            setConfig(response.data.data.config);
        } catch (error) {
            console.error('Failed to fetch config:', error);
            // Use defaults if config fetch fails
            setConfig(getDefaultConfig());
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = async (updates) => {
        try {
            const response = await api.put('/config', updates);
            setConfig(response.data.data.config);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Update failed' };
        }
    };

    // Helper to get label based on language
    const getLabel = (option, isHindi = false) => {
        if (!option) return '';
        if (typeof option === 'string') return option;
        return isHindi ? (option.labelHi || option.labelEn) : option.labelEn;
    };

    // Helper to get options for a specific field
    const getOptions = (field, isHindi = false) => {
        if (!config || !config[field]) return [];
        return config[field].map(opt => ({
            value: typeof opt === 'string' ? opt : opt.value,
            label: typeof opt === 'string' ? opt : getLabel(opt, isHindi)
        }));
    };

    const value = {
        config,
        loading,
        fetchConfig,
        updateConfig,
        getLabel,
        getOptions,

        // Convenience getters for common options
        rashiOptions: config?.rashiOptions || [],
        nakshatraOptions: config?.nakshatraOptions || [],
        stateOptions: config?.stateOptions || [],
        religionOptions: config?.religionOptions || [],
        languageOptions: config?.languageOptions || [],
        educationOptions: config?.educationOptions || [],
        professionOptions: config?.professionOptions || [],
        incomeOptions: config?.incomeOptions || [],
        complexionOptions: config?.complexionOptions || [],
        bodyTypeOptions: config?.bodyTypeOptions || [],
        dietOptions: config?.dietOptions || [],
        maritalStatusOptions: config?.maritalStatusOptions || [],
        familyTypeOptions: config?.familyTypeOptions || [],
        manglikOptions: config?.manglikOptions || [],
        casteOptions: config?.casteOptions || [],

        // App branding
        appName: config?.appName || 'Matrimonia',
        appNameHi: config?.appNameHi || 'मैट्रिमोनिया',
        tagline: config?.tagline || 'Where Families Connect',
        taglineHi: config?.taglineHi || 'जहाँ परिवार मिलते हैं',
        logoUrl: config?.logoUrl || '/logo.png',
        primaryColor: config?.primaryColor || '#A0153E',
        accentColor: config?.accentColor || '#D4AF37',
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
}

// Default config to use before fetching
function getDefaultConfig() {
    return {
        appName: 'Matrimonia',
        appNameHi: 'मैट्रिमोनिया',
        logoUrl: '/logo.png',
        rashiOptions: [],
        nakshatraOptions: [],
        stateOptions: [],
        religionOptions: [],
        languageOptions: [],
        educationOptions: [],
        professionOptions: [],
        incomeOptions: [],
        complexionOptions: [],
        bodyTypeOptions: [],
        dietOptions: [],
        maritalStatusOptions: [],
        familyTypeOptions: [],
        manglikOptions: [],
        casteOptions: []
    };
}

export default ConfigContext;
