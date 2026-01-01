import React from 'react';
import { Result, Button, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#FFFBF5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Result
                        status="error"
                        title="Something went wrong"
                        subTitle="We encountered an unexpected error. Please try refreshing the page."
                        extra={[
                            <Button type="primary" key="refresh" onClick={() => window.location.reload()}>
                                Refresh Page
                            </Button>,
                            <Button key="home" onClick={() => window.location.href = '/'}>
                                Go Home
                            </Button>,
                        ]}
                    >
                        <div className="desc">
                            <Paragraph>
                                <Text
                                    strong
                                    style={{
                                        fontSize: 16,
                                    }}
                                >
                                    Error Details:
                                </Text>
                            </Paragraph>
                            <Paragraph>
                                <pre style={{ textAlign: 'left', background: '#fff', padding: 12, borderRadius: 8, fontSize: 12, overflow: 'auto', maxWidth: '80vw' }}>
                                    {this.state.error && this.state.error.toString()}
                                </pre>
                            </Paragraph>
                        </div>
                    </Result>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
