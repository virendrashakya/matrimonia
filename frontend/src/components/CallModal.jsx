import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Avatar, Typography, Space } from 'antd';
import { PhoneOutlined, AudioMutedOutlined, AudioOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import Peer from 'simple-peer';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const { Text, Title } = Typography;

const CallModal = () => {
    const {
        incomingCall,
        outgoingCall,
        callAccepted,
        socket,
        userStream,
        answerCall,
        endCall
    } = useChat();
    const { user } = useAuth();

    const [callTimer, setCallTimer] = useState(0);
    const connectionRef = useRef();
    const userAudio = useRef();

    const [isMuted, setIsMuted] = useState(false);

    // Timer logic
    useEffect(() => {
        let interval;
        if (callAccepted) {
            interval = setInterval(() => {
                setCallTimer(prev => prev + 1);
            }, 1000);
        } else {
            setCallTimer(0);
        }
        return () => clearInterval(interval);
    }, [callAccepted]);

    // Handle Signaling
    useEffect(() => {
        if (!socket) return;

        // If initiating a call (initiator)
        if (outgoingCall && !connectionRef.current) {
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: userStream
            });

            peer.on('signal', (data) => {
                console.log("CallModal: Peer signaling data generated, emitting call_user to:", outgoingCall.to);
                socket.emit('call_user', {
                    userToCall: outgoingCall.to,
                    signalData: data,
                    from: user?._id,
                    name: user?.name || 'User'
                });
            });

            peer.on('stream', (stream) => {
                if (userAudio.current) {
                    userAudio.current.srcObject = stream;
                }
            });

            connectionRef.current = peer;
        }

        // If receiving call and accepted
        if (incomingCall && callAccepted && !connectionRef.current) {
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: userStream
            });

            peer.on('signal', (data) => {
                console.log("CallModal: Answering call, signal generated for:", incomingCall.from);
                socket.emit('answer_call', { signal: data, to: incomingCall.from });
            });

            peer.on('stream', (stream) => {
                if (userAudio.current) {
                    userAudio.current.srcObject = stream;
                }
            });

            peer.signal(incomingCall.signal);
            connectionRef.current = peer;
        }

        // If outgoing call is accepted by remote
        if (outgoingCall?.signal && connectionRef.current && !connectionRef.current.connected) {
            connectionRef.current.signal(outgoingCall.signal);
        }

        // Cleanup on end
        if (!incomingCall && !outgoingCall) {
            if (connectionRef.current) {
                connectionRef.current.destroy();
                connectionRef.current = null;
            }
        }
    }, [incomingCall, outgoingCall, callAccepted, socket, userStream]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const activeCall = incomingCall || outgoingCall;

    useEffect(() => {
        if (activeCall) {
            console.log("CallModal: Active call detected!", activeCall.name, activeCall.from ? "Incoming" : "Outgoing");
        }
    }, [activeCall]);

    if (!activeCall) return null;

    return (
        <>
            <Modal
                title={callAccepted ? "Active Call" : (outgoingCall ? "Calling..." : "Incoming Call")}
                open={!!activeCall}
                footer={null}
                closable={false}
                maskClosable={false}
                centered
                width={350}
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ marginBottom: 24 }}>
                        <Avatar
                            size={100}
                            icon={<UserOutlined />}
                            style={{
                                backgroundColor: callAccepted ? '#52c41a' : '#1890ff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
                            {activeCall.name}
                        </Title>
                        <Text type="secondary">
                            {callAccepted ? formatTime(callTimer) : (outgoingCall ? 'Connecting...' : 'Incoming Voice Call')}
                        </Text>
                    </div>

                    {/* Remote Audio Element */}
                    <audio playsInline ref={userAudio} autoPlay style={{ display: 'none' }} />

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 32 }}>
                        {!callAccepted && incomingCall && (
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<PhoneOutlined />}
                                size="large"
                                style={{ backgroundColor: '#52c41a', border: 'none', width: 64, height: 64, fontSize: 24 }}
                                onClick={answerCall}
                            />
                        )}

                        {callAccepted && (
                            <Button
                                shape="circle"
                                icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
                                size="large"
                                style={{ width: 56, height: 56 }}
                                onClick={() => {
                                    setIsMuted(!isMuted);
                                    if (userStream) {
                                        userStream.getAudioTracks()[0].enabled = isMuted;
                                    }
                                }}
                            />
                        )}

                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            icon={<CloseCircleOutlined />}
                            size="large"
                            style={{ width: 64, height: 64, fontSize: 24 }}
                            onClick={endCall}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CallModal;
