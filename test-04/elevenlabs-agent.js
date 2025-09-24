/**
 * ElevenLabs Conversational AI Wrapper
 * Handles both Agent Mode (WebSocket) and Traditional Mode (TTS API)
 * Version 2.0 - Full integration with real-time communication
 */

class ElevenLabsAgent {
    constructor() {
        this.agentId = null;
        this.apiKey = null;
        this.websocket = null;
        this.isConnected = false;
        this.conversationId = null;
        this.audioContext = null;
        this.currentMode = null; // 'agent' or 'traditional'
        this.eventListeners = new Map();
        this.audioQueue = [];
        this.isPlaying = false;
        this.transcript = [];
        this.onTranscriptCallback = null;
        this.onErrorCallback = null;
        this.onConnectCallback = null;
        this.onDisconnectCallback = null;

        this.initAudioContext();
    }

    /**
     * Initialize audio context
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized');
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
        }
    }

    /**
     * Set API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Set Agent ID
     */
    setAgentId(agentId) {
        this.agentId = agentId;
    }

    /**
     * Initialize Agent Mode (WebSocket connection)
     */
    async initAgentMode() {
        if (!this.agentId || !this.apiKey) {
            throw new Error('Agent ID and API key must be set before initializing Agent Mode');
        }

        this.currentMode = 'agent';

        try {
            // Create WebSocket connection
            this.websocket = new WebSocket(`wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${this.agentId}`, [
                'realtime',
                `Bearer.${this.apiKey}`
            ]);

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('WebSocket connection timeout'));
                }, 10000);

                this.websocket.onopen = () => {
                    clearTimeout(timeout);
                    this.isConnected = true;
                    console.log('ElevenLabs Agent WebSocket connected');
                    this.triggerEvent('connected');
                    resolve();
                };

                this.websocket.onmessage = (event) => {
                    this.handleWebSocketMessage(event);
                };

                this.websocket.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error('WebSocket error:', error);
                    this.triggerEvent('error', error);
                    reject(error);
                };

                this.websocket.onclose = (event) => {
                    this.isConnected = false;
                    console.log('WebSocket disconnected:', event.code, event.reason);
                    this.triggerEvent('disconnected', event);
                };
            });
        } catch (error) {
            console.error('Failed to initialize Agent Mode:', error);
            throw error;
        }
    }

    /**
     * Initialize Traditional Mode (TTS API)
     */
    async initTraditionalMode() {
        if (!this.apiKey) {
            throw new Error('API key must be set before initializing Traditional Mode');
        }

        this.currentMode = 'traditional';
        console.log('ElevenLabs Traditional Mode initialized');
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'conversation_initiation_metadata':
                    this.handleConversationInitiation(message);
                    break;

                case 'audio':
                    this.handleAudioMessage(message);
                    break;

                case 'interruption':
                    this.handleInterruption(message);
                    break;

                case 'user_transcript':
                    this.handleUserTranscript(message);
                    break;

                case 'agent_response':
                    this.handleAgentResponse(message);
                    break;

                default:
                    console.log('Unhandled message type:', message.type);
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }

    /**
     * Handle conversation initiation
     */
    handleConversationInitiation(message) {
        this.conversationId = message.conversation_id;
        console.log('Conversation initiated:', this.conversationId);
        this.triggerEvent('conversationStarted', message);
    }

    /**
     * Handle audio messages
     */
    handleAudioMessage(message) {
        if (message.audio) {
            this.playAudioChunk(message.audio);
        }
    }

    /**
     * Handle interruption
     */
    handleInterruption(message) {
        console.log('Conversation interrupted');
        this.stopAudioPlayback();
        this.triggerEvent('interrupted', message);
    }

    /**
     * Handle user transcript
     */
    handleUserTranscript(message) {
        console.log('User transcript:', message);
        this.addToTranscript('user', message.text);
        this.triggerEvent('userTranscript', message);
    }

    /**
     * Handle agent response
     */
    handleAgentResponse(message) {
        console.log('Agent response:', message);
        this.addToTranscript('agent', message.text);
        this.triggerEvent('agentResponse', message);
    }

    /**
     * Send message in Agent Mode
     */
    sendMessage(text) {
        if (!this.isConnected || this.currentMode !== 'agent') {
            throw new Error('Agent Mode not connected');
        }

        const message = {
            user_message: text
        };

        this.websocket.send(JSON.stringify(message));
        console.log('Message sent to agent:', text);
    }

    /**
     * Generate speech in Traditional Mode
     */
    async generateSpeech(text, voiceId = '21m00Tcm4TlvDq8ikWAM') {
        if (this.currentMode !== 'traditional') {
            throw new Error('Traditional Mode not initialized');
        }

        try {
            const response = await fetch(`${CONFIG.APIS.ELEVENLABS.BASE_URL}${CONFIG.APIS.ELEVENLABS.TTS_ENDPOINT}/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`TTS API error: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            return new Promise((resolve, reject) => {
                const audio = new Audio(audioUrl);
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    resolve();
                };
                audio.onerror = reject;
                audio.play().catch(reject);
            });
        } catch (error) {
            console.error('TTS generation failed:', error);
            throw error;
        }
    }

    /**
     * Play audio chunk (for Agent Mode)
     */
    playAudioChunk(audioBase64) {
        try {
            const audioData = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
            this.audioQueue.push(audioData);

            if (!this.isPlaying) {
                this.processAudioQueue();
            }
        } catch (error) {
            console.error('Error processing audio chunk:', error);
        }
    }

    /**
     * Process audio queue
     */
    async processAudioQueue() {
        if (this.audioQueue.length === 0 || this.isPlaying) {
            return;
        }

        this.isPlaying = true;

        while (this.audioQueue.length > 0) {
            const audioData = this.audioQueue.shift();

            try {
                await this.playAudioData(audioData);
            } catch (error) {
                console.error('Error playing audio data:', error);
            }
        }

        this.isPlaying = false;
    }

    /**
     * Play audio data
     */
    playAudioData(audioData) {
        return new Promise((resolve, reject) => {
            if (!this.audioContext) {
                reject(new Error('Audio context not available'));
                return;
            }

            try {
                this.audioContext.decodeAudioData(audioData.buffer.slice(), (buffer) => {
                    const source = this.audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(this.audioContext.destination);
                    source.onended = resolve;
                    source.start();
                }, reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Stop audio playback
     */
    stopAudioPlayback() {
        this.audioQueue = [];
        this.isPlaying = false;

        // Stop any currently playing audio
        if (this.audioContext) {
            try {
                this.audioContext.suspend();
            } catch (error) {
                console.error('Error stopping audio:', error);
            }
        }
    }

    /**
     * Add to transcript
     */
    addToTranscript(speaker, text) {
        this.transcript.push({
            speaker: speaker,
            text: text,
            timestamp: Date.now()
        });

        if (this.onTranscriptCallback) {
            this.onTranscriptCallback(this.transcript);
        }
    }

    /**
     * Get conversation transcript
     */
    async getTranscript() {
        if (this.currentMode === 'agent' && this.conversationId) {
            try {
                const response = await fetch(`${CONFIG.APIS.ELEVENLABS.BASE_URL}${CONFIG.APIS.ELEVENLABS.CONVERSATIONS_ENDPOINT}/${this.conversationId}`, {
                    headers: {
                        'xi-api-key': this.apiKey
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.transcript || [];
                }
            } catch (error) {
                console.error('Failed to get conversation transcript:', error);
            }
        }

        return this.transcript;
    }

    /**
     * End conversation
     */
    endConversation() {
        if (this.currentMode === 'agent' && this.websocket) {
            this.websocket.close();
            this.isConnected = false;
        }

        this.stopAudioPlayback();
        this.transcript = [];
        this.conversationId = null;
        this.currentMode = null;

        console.log('Conversation ended');
        this.triggerEvent('conversationEnded');
    }

    /**
     * Set event listener
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Trigger event
     */
    triggerEvent(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event callback:', error);
                }
            });
        }
    }

    /**
     * Set transcript callback
     */
    setTranscriptCallback(callback) {
        this.onTranscriptCallback = callback;
    }

    /**
     * Set error callback
     */
    setErrorCallback(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * Set connect callback
     */
    setConnectCallback(callback) {
        this.onConnectCallback = callback;
    }

    /**
     * Set disconnect callback
     */
    setDisconnectCallback(callback) {
        this.onDisconnectCallback = callback;
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            currentMode: this.currentMode,
            conversationId: this.conversationId,
            hasApiKey: !!this.apiKey,
            hasAgentId: !!this.agentId
        };
    }

    /**
     * Test connection
     */
    async testConnection() {
        if (this.currentMode === 'agent') {
            return this.isConnected;
        } else if (this.currentMode === 'traditional') {
            try {
                const response = await fetch(`${CONFIG.APIS.ELEVENLABS.BASE_URL}/v1/voices`, {
                    headers: {
                        'xi-api-key': this.apiKey
                    }
                });
                return response.ok;
            } catch (error) {
                return false;
            }
        }
        return false;
    }
}

// Create global instance
const elevenLabsAgent = new ElevenLabsAgent();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElevenLabsAgent;
} else {
    window.ElevenLabsAgent = ElevenLabsAgent;
    window.elevenLabsAgent = elevenLabsAgent;
}