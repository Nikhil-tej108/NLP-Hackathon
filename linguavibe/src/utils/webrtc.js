import { io } from 'socket.io-client';

// Automatically detect backend URL based on how the page was accessed
const getBackendURL = () => {
    // If accessed via network IP, use that IP with port 8000
    // If accessed via localhost, use localhost:8000
    const hostname = window.location.hostname;
    
    // If hostname is localhost or 127.0.0.1, use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }
    
    // Otherwise, use the same hostname with port 8000
    return `http://${hostname}:8000`;
};

const BACKEND_URL = getBackendURL();
console.log('Backend URL:', BACKEND_URL);

class WebRTCManager {
    constructor() {
        this.socket = null;
        this.peerConnections = {};
        this.localStream = null;
        this.remoteStreams = {};
        this.room = null;
        this.targetLanguage = 'en';
        this.onMessageCallback = null;
        this.isInitializing = false;
        this.initPromise = null;
    }

    async init(room, targetLanguage, onMessage) {
        // If already initializing, return the existing promise
        if (this.isInitializing && this.initPromise) {
            return this.initPromise;
        }

        this.room = room;
        this.targetLanguage = targetLanguage;
        this.onMessageCallback = onMessage;

        // If already connected, just update settings and rejoin
        if (this.socket && this.socket.connected) {
            try {
                this.joinRoom();
                return Promise.resolve();
            } catch (e) {
                console.warn('joinRoom after init reuse failed', e);
            }
            return Promise.resolve();
        }

        // If socket exists but disconnected, clean it up first
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }

        this.isInitializing = true;

        // Initialize Socket.IO connection
        this.socket = io(BACKEND_URL, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            upgrade: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            timeout: 20000,
            autoConnect: true
        });

        this.setupSocketListeners();
        
        // Wait for connection before joining room
        this.initPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.isInitializing = false;
                reject(new Error('Connection timeout'));
            }, 10000);

            const onConnect = async () => {
                clearTimeout(timeout);
                this.isInitializing = false;
                console.log('Connected to signaling server, sid=', this.socket.id);
                
                // Remove the one-time listener
                this.socket.off('connect', onConnect);
                this.socket.off('connect_error', onError);
                
                try {
                    this.joinRoom();
                    resolve();
                } catch (e) {
                    console.error('Failed to join room:', e);
                    reject(e);
                }
            };

            const onError = (err) => {
                clearTimeout(timeout);
                this.isInitializing = false;
                console.error('Socket connect_error:', err);
                
                // Remove the one-time listener
                this.socket.off('connect', onConnect);
                this.socket.off('connect_error', onError);
                
                reject(err);
            };

            // Check if already connected (race condition)
            if (this.socket.connected) {
                onConnect();
            } else {
                this.socket.once('connect', onConnect);
                this.socket.once('connect_error', onError);
            }
        });

        return this.initPromise;
    }

    setupSocketListeners() {
        // Remove any existing listeners first
        this.socket.removeAllListeners();

        // Connection status events
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Reconnect manually if server disconnected
                this.socket.connect();
            }
        });

        this.socket.on('reconnect_attempt', (attempt) => {
            console.log('Socket reconnect attempt', attempt);
        });

        this.socket.on('reconnect', () => {
            console.log('Socket reconnected');
            // Rejoin room after reconnection
            if (this.room) {
                this.joinRoom();
            }
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connect_error:', err);
        });

        // WebRTC signaling events
        this.socket.on('peer_joined', async ({ peer }) => {
            console.log('Peer joined:', peer);
            await this.initializePeerConnection(peer);
            await this.createAndSendOffer(peer);
        });

        this.socket.on('sdp', async ({ sdp, source }) => {
            if (!this.peerConnections[source]) {
                await this.initializePeerConnection(source);
            }

            if (sdp.type === 'offer') {
                await this.handleOffer(sdp, source);
            } else if (sdp.type === 'answer') {
                await this.handleAnswer(sdp, source);
            }
        });

        this.socket.on('ice', async ({ ice, source }) => {
            const pc = this.peerConnections[source];
            if (pc) {
                try {
                    await pc.addIceCandidate(ice);
                } catch (e) {
                    console.error('Error adding ICE candidate for', source, e);
                }
            }
        });

        this.socket.on('translated_message', (data) => {
            if (this.onMessageCallback) {
                this.onMessageCallback(data);
            }
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    joinRoom() {
        if (!this.socket || !this.socket.connected) {
            console.warn('Cannot join room: socket not connected');
            return;
        }
        
        this.socket.emit('join_room', {
            room: this.room,
            target_language: this.targetLanguage
        });
        
        console.log('Joined room:', this.room);
    }

    async initializePeerConnection(peerId) {
        if (!peerId) {
            console.warn('initializePeerConnection called without peerId');
            return;
        }

        // Don't create duplicate connections
        if (this.peerConnections[peerId]) {
            return this.peerConnections[peerId];
        }

        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        const pc = new RTCPeerConnection(configuration);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('relay_ice', {
                    ice: event.candidate,
                    target: peerId
                });
            }
        };

        pc.ontrack = (event) => {
            this.remoteStreams[peerId] = event.streams[0];
            console.log('Received remote track from', peerId);
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`ICE connection state for ${peerId}:`, pc.iceConnectionState);
        };

        pc.onconnectionstatechange = () => {
            console.log(`Connection state for ${peerId}:`, pc.connectionState);
        };

        // Add local tracks to the connection
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
            });
        }

        this.peerConnections[peerId] = pc;
        return pc;
    }

    async createAndSendOffer(targetPeer) {
        try {
            const pc = this.peerConnections[targetPeer] || await this.initializePeerConnection(targetPeer);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            this.socket.emit('relay_sdp', {
                sdp: offer,
                target: targetPeer
            });
        } catch (e) {
            console.error('Error creating offer for', targetPeer, e);
        }
    }

    async handleOffer(offer, source) {
        try {
            const pc = this.peerConnections[source] || await this.initializePeerConnection(source);

            // Check if we're in a bad state
            if (pc.signalingState === 'closed') {
                console.log('Peer connection closed, reinitializing');
                await this.initializePeerConnection(source);
                return this.handleOffer(offer, source);
            }

            // Handle glare condition (both sides sending offers simultaneously)
            if (pc.signalingState === 'have-local-offer') {
                console.log('Glare detected: both sides sent offers, using tiebreaker');
                // Use stable tiebreaker: compare socket IDs lexicographically
                if (this.socket.id < source) {
                    console.log('We lose tiebreaker, rolling back our offer');
                    await pc.setLocalDescription({ type: 'rollback' });
                } else {
                    console.log('We win tiebreaker, ignoring incoming offer');
                    return; // Ignore their offer, they should rollback
                }
            } else if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-remote-offer') {
                console.log(`Unexpected signaling state: ${pc.signalingState}, performing rollback`);
                try {
                    await pc.setLocalDescription({ type: 'rollback' });
                } catch (e) {
                    console.warn('Rollback failed:', e);
                    // If rollback fails, recreate the peer connection
                    await this.initializePeerConnection(source);
                    return this.handleOffer(offer, source);
                }
            }

            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            this.socket.emit('relay_sdp', {
                sdp: answer,
                target: source
            });
        } catch (e) {
            console.error('Error handling offer from', source, e);
            // Try to recover by recreating the connection
            delete this.peerConnections[source];
        }
    }

    async handleAnswer(answer, source) {
        try {
            const pc = this.peerConnections[source];
            if (!pc) {
                console.warn('handleAnswer: no pc for', source);
                return;
            }

            await pc.setRemoteDescription(answer);
        } catch (e) {
            console.error('Error handling answer from', source, e);
        }
    }

    async startLocalStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            return this.localStream;
        } catch (e) {
            console.error('Error accessing media devices:', e);
            throw e;
        }
    }

    async sendMessage(text) {
        if (!this.socket || !this.socket.connected) {
            console.error('Cannot send message: socket not connected');
            return;
        }
        
        // Don't send target_lang - server will translate based on each receiver's preference
        this.socket.emit('translate_message', {
            text
        });
    }

    disconnect() {
        // Prevent double disconnect calls
        if (!this.socket && !this.localStream && Object.keys(this.peerConnections).length === 0) {
            return;
        }

        console.log('Disconnecting WebRTC manager');
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        // Close all peer connections
        Object.values(this.peerConnections).forEach(pc => {
            try {
                pc.close();
            } catch (e) {
                // Ignore errors during cleanup
            }
        });
        this.peerConnections = {};
        this.remoteStreams = {};
        
        if (this.socket) {
            try {
                this.socket.removeAllListeners();
                // Only disconnect if connected
                if (this.socket.connected) {
                    this.socket.disconnect();
                }
            } catch (e) {
                // Ignore errors during cleanup
            }
            this.socket = null;
        }
        
        this.isInitializing = false;
        this.initPromise = null;
    }
}

export default WebRTCManager;