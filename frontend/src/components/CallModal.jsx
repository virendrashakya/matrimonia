import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Avatar, Typography, Space } from 'antd';
import { PhoneOutlined, AudioMutedOutlined, AudioOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Peer from 'simple-peer';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const { Text, Title } = Typography;

const CallModal = () => {
    const {
        incomingCall,
        callAccepted,
        setCallAccepted,
        socket,
        setIncomingCall,
        answerCall,
        rejectCall
    } = useChat();

    const { user } = useAuth();
    const [stream, setStream] = useState(null);
    const [callEnded, setCallEnded] = useState(false);
    const connectionRef = useRef();
    const myVideo = useRef();
    const userVideo = useRef(); // Even if audio only, peer needs stream ref sometimes

    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (incomingCall || callAccepted) {
            navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                .then((currentStream) => {
                    setStream(currentStream);
                    if (myVideo.current) {
                        myVideo.current.srcObject = currentStream;
                    }
                })
                .catch(err => console.error('Failed to get local stream', err));
        } else {
            // Stop stream if modal closes
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        }
    }, [incomingCall, callAccepted]);

    const handleAnswer = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on('signal', (data) => {
            socket.emit('answer_call', { signal: data, to: incomingCall.from });
        });

        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal(incomingCall.signal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        socket.emit("call_ended"); // Notify other user if possible
        setIncomingCall(null);
        setCallAccepted(false);
        setCallEnded(false);
    };

    // If incoming call
    return (
        <>
            {/* Incoming Call Modal */}
            <Modal
                title="Incoming Call"
                open={!!incomingCall && !callAccepted}
                footer={null}
                closable={false}
                maskClosable={false}
                centered
            >
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <Avatar size={80} icon={<PhoneOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} />
                    <Title level={4}>{incomingCall?.name || 'Unknown Caller'}</Title>
                    <Text>is calling you...</Text>
                    <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 20 }}>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<PhoneOutlined />}
                            size="large"
                            style={{ backgroundColor: '#52c41a', border: 'none', width: 60, height: 60 }}
                            onClick={handleAnswer}
                        />
                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            icon={<CloseCircleOutlined />}
                            size="large"
                            style={{ width: 60, height: 60 }}
                            onClick={leaveCall} // Reject
                        />
                    </div>
                </div>
            </Modal>

            {/* Active Call Modal */}
            <Modal
                title="Voice Call"
                open={callAccepted && !callEnded}
                footer={null}
                closable={false}
                maskClosable={false}
                centered
            >
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 30 }}>
                        <div style={{ textAlign: 'center' }}>
                            <Avatar size={64} style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}>You</Avatar>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            {/* Remote Audio */}
                            <audio playsInline ref={userVideo} autoPlay />
                            <Avatar size={64} style={{ backgroundColor: '#87d068' }}>{incomingCall?.name?.[0] || 'U'}</Avatar>
                        </div>
                    </div>
                    <Title level={5} style={{ color: 'green' }}>Connected</Title>
                    <Text type="secondary">00:00</Text> {/* Timer could be added */}

                    <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 20 }}>
                        <Button
                            shape="circle"
                            icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
                            size="large"
                            onClick={() => {
                                setIsMuted(!isMuted);
                                if (stream) {
                                    stream.getAudioTracks()[0].enabled = isMuted; // Toggle
                                }
                            }}
                        />
                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            icon={<PhoneOutlined rotate={135} />}
                            size="large"
                            style={{ width: 60, height: 60 }}
                            onClick={leaveCall}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CallModal;
