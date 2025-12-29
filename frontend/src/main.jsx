import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ConfigProvider as AppConfigProvider } from './context/ConfigContext'
import { AccessibilityProvider } from './context/AccessibilityContext'
import { ShortlistProvider } from './context/ShortlistContext'
import './index.css'

// Matrimonial-themed Ant Design customization
// Warm traditional colors with balanced sizing
const theme = {
    token: {
        // Primary colors - Deep maroon/burgundy for tradition
        colorPrimary: '#A0153E',
        colorPrimaryHover: '#8B0A30',
        colorPrimaryActive: '#6D0825',

        // Success/verified - Emerald green
        colorSuccess: '#059669',

        // Warning - Gold/amber
        colorWarning: '#D97706',

        // Error - Deep red
        colorError: '#DC2626',

        // Background colors
        colorBgContainer: '#FFFBF5',
        colorBgLayout: '#FFF8F0',

        // Border
        borderRadius: 8,
        borderRadiusLG: 12,

        // Typography - balanced
        fontSize: 14,
        fontSizeHeading1: 28,
        fontSizeHeading2: 22,
        fontSizeHeading3: 18,
        fontSizeHeading4: 16,

        // Sizing - compact but usable
        controlHeight: 36,
        controlHeightLG: 42,
        controlHeightSM: 28,

        // Font
        fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
        Button: {
            controlHeight: 36,
            fontSize: 14,
            borderRadius: 8,
            primaryShadow: '0 2px 8px rgba(160, 21, 62, 0.2)',
        },
        Input: {
            controlHeight: 36,
            fontSize: 14,
            borderRadius: 8,
        },
        Select: {
            controlHeight: 36,
            fontSize: 14,
            borderRadius: 8,
        },
        Card: {
            borderRadiusLG: 12,
            boxShadowTertiary: '0 2px 12px rgba(0, 0, 0, 0.06)',
        },
        Menu: {
            itemHeight: 40,
            fontSize: 14,
        },
        Table: {
            headerBg: '#FFF5EB',
            rowHoverBg: '#FFF8F0',
        },
        Tag: {
            borderRadiusSM: 6,
        },
    },
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ConfigProvider theme={theme}>
                <AppConfigProvider>
                    <LanguageProvider>
                        <AccessibilityProvider>
                            <ShortlistProvider>
                                <AuthProvider>
                                    <App />
                                    <Toaster
                                        position="top-center"
                                        toastOptions={{
                                            duration: 4000,
                                            style: {
                                                fontSize: '14px',
                                                padding: '12px 20px',
                                                borderRadius: '8px',
                                                background: '#FFFBF5',
                                                border: '1px solid #F3E8D8',
                                            }
                                        }}
                                    />
                                </AuthProvider>
                            </ShortlistProvider>
                        </AccessibilityProvider>
                    </LanguageProvider>
                </AppConfigProvider>
            </ConfigProvider>
        </BrowserRouter>
    </React.StrictMode>
)


