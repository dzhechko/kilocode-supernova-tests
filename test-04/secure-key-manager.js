/**
 * Secure API Key Management System
 * Handles user-provided API keys with memory-based encryption and auto-expiration
 * Version 2.0 - Enhanced with ElevenLabs Agent ID support
 */

class SecureKeyManager {
    constructor() {
        this.keys = new Map();
        this.expiryTimers = new Map();
        this.isEncrypted = false;
        this.encryptionKey = null;
        this.initialized = false;

        this.init();
    }

    /**
     * Initialize the key manager
     */
    async init() {
        try {
            // Generate encryption key for this session
            this.encryptionKey = await this.generateEncryptionKey();
            this.isEncrypted = true;
            this.initialized = true;

            // Load existing keys from localStorage
            this.loadKeysFromStorage();

            console.log('SecureKeyManager initialized');
        } catch (error) {
            console.error('Failed to initialize SecureKeyManager:', error);
            this.initialized = false;
        }
    }

    /**
     * Generate encryption key for this session
     */
    async generateEncryptionKey() {
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            crypto.getRandomValues(new Uint8Array(32)),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: crypto.getRandomValues(new Uint8Array(16)),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Store an API key securely
     */
    async storeKey(service, keyValue) {
        if (!this.initialized) {
            throw new Error('SecureKeyManager not initialized');
        }

        // Validate key format
        this.validateKeyFormat(service, keyValue);

        try {
            // Encrypt the key
            const encryptedKey = await this.encryptKey(keyValue);

            // Store in memory
            this.keys.set(service, {
                value: encryptedKey,
                timestamp: Date.now(),
                validated: false
            });

            // Set expiry timer
            this.setExpiryTimer(service);

            // Save to localStorage
            this.saveKeysToStorage();

            console.log(`API key for ${service} stored securely`);
            return true;
        } catch (error) {
            console.error(`Failed to store key for ${service}:`, error);
            throw error;
        }
    }

    /**
     * Retrieve a decrypted API key
     */
    async getKey(service) {
        if (!this.initialized) {
            throw new Error('SecureKeyManager not initialized');
        }

        const keyData = this.keys.get(service);
        if (!keyData) {
            return null;
        }

        try {
            // Decrypt the key
            const decryptedKey = await this.decryptKey(keyData.value);
            return decryptedKey;
        } catch (error) {
            console.error(`Failed to retrieve key for ${service}:`, error);
            // Remove corrupted key
            this.keys.delete(service);
            this.saveKeysToStorage();
            return null;
        }
    }

    /**
     * Remove an API key
     */
    removeKey(service) {
        if (!this.initialized) {
            return false;
        }

        // Clear expiry timer
        if (this.expiryTimers.has(service)) {
            clearTimeout(this.expiryTimers.get(service));
            this.expiryTimers.delete(service);
        }

        // Remove from memory
        const removed = this.keys.delete(service);

        // Save to localStorage
        this.saveKeysToStorage();

        console.log(`API key for ${service} removed`);
        return removed;
    }

    /**
     * Test if an API key is valid
     */
    async testKey(service, keyValue) {
        try {
            switch (service) {
                case 'elevenlabs':
                    return await this.testElevenLabsKey(keyValue);
                case 'openai':
                    return await this.testOpenAIKey(keyValue);
                case 'agent':
                    return await this.testAgentId(keyValue);
                default:
                    throw new Error(`Unknown service: ${service}`);
            }
        } catch (error) {
            console.error(`Key test failed for ${service}:`, error);
            return false;
        }
    }

    /**
     * Test ElevenLabs API key
     */
    async testElevenLabsKey(keyValue) {
        try {
            const response = await fetch(`${CONFIG.APIS.ELEVENLABS.BASE_URL}/v1/user`, {
                headers: {
                    'xi-api-key': keyValue
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('ElevenLabs API key validated successfully');
                return true;
            } else {
                console.log('ElevenLabs API key validation failed');
                return false;
            }
        } catch (error) {
            console.error('ElevenLabs API key test error:', error);
            return false;
        }
    }

    /**
     * Test OpenAI API key
     */
    async testOpenAIKey(keyValue) {
        try {
            const response = await fetch(`${CONFIG.APIS.OPENAI.BASE_URL}/v1/models`, {
                headers: {
                    'Authorization': `Bearer ${keyValue}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('OpenAI API key validated successfully');
                return true;
            } else {
                console.log('OpenAI API key validation failed');
                return false;
            }
        } catch (error) {
            console.error('OpenAI API key test error:', error);
            return false;
        }
    }

    /**
     * Test ElevenLabs Agent ID
     */
    async testAgentId(agentId) {
        try {
            // Test agent ID format and basic validation
            const isValidFormat = /^[a-zA-Z0-9_-]{20,}$/.test(agentId) ||
                                 /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId);

            if (!isValidFormat) {
                console.log('Invalid Agent ID format');
                return false;
            }

            // For now, we'll assume the format validation is sufficient
            // In a real implementation, you might want to test the agent endpoint
            console.log('Agent ID format validated successfully');
            return true;
        } catch (error) {
            console.error('Agent ID test error:', error);
            return false;
        }
    }

    /**
     * Get current key status
     */
    getKeyStatus() {
        const status = {
            elevenlabs: this.keys.has('elevenlabs'),
            openai: this.keys.has('openai'),
            agent: this.keys.has('agent')
        };

        // Determine overall status
        if (status.openai && status.agent) {
            status.mode = 'agent'; // Agent Mode available
            status.level = 'full';
        } else if (status.openai && status.elevenlabs) {
            status.mode = 'traditional'; // Traditional Mode available
            status.level = 'full';
        } else if (status.openai || status.elevenlabs || status.agent) {
            status.mode = 'partial'; // Partial setup
            status.level = 'partial';
        } else {
            status.mode = 'demo'; // No keys
            status.level = 'none';
        }

        return status;
    }

    /**
     * Validate key format
     */
    validateKeyFormat(service, keyValue) {
        if (!keyValue || typeof keyValue !== 'string') {
            throw new Error('Key value must be a non-empty string');
        }

        if (keyValue.length < CONFIG.SECURITY.MIN_KEY_LENGTH) {
            throw new Error(`Key too short (minimum ${CONFIG.SECURITY.MIN_KEY_LENGTH} characters)`);
        }

        if (keyValue.length > CONFIG.SECURITY.MAX_KEY_LENGTH) {
            throw new Error(`Key too long (maximum ${CONFIG.SECURITY.MAX_KEY_LENGTH} characters)`);
        }

        switch (service) {
            case 'elevenlabs':
                if (!keyValue.startsWith('sk_') && !keyValue.startsWith('sk-') &&
                    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(keyValue)) {
                    throw new Error('ElevenLabs API key must start with "sk_" or "sk-" or be a valid UUID');
                }
                break;

            case 'openai':
                if (!keyValue.startsWith('sk-') || keyValue.length < 48) {
                    throw new Error('OpenAI API key must start with "sk-" and be at least 48 characters long');
                }
                break;

            case 'agent':
                if (!/^[a-zA-Z0-9_-]{20,}$/.test(keyValue) &&
                    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(keyValue)) {
                    throw new Error('Agent ID must be alphanumeric with dashes/underscores (20+ chars) or a valid UUID');
                }
                break;
        }
    }

    /**
     * Encrypt a key value
     */
    async encryptKey(keyValue) {
        if (!this.isEncrypted || !this.encryptionKey) {
            throw new Error('Encryption not available');
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(keyValue);
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            this.encryptionKey,
            data
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        return btoa(String.fromCharCode(...combined));
    }

    /**
     * Decrypt a key value
     */
    async decryptKey(encryptedValue) {
        if (!this.isEncrypted || !this.encryptionKey) {
            throw new Error('Encryption not available');
        }

        const combined = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            this.encryptionKey,
            encrypted
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }

    /**
     * Set expiry timer for a key
     */
    setExpiryTimer(service) {
        // Clear existing timer
        if (this.expiryTimers.has(service)) {
            clearTimeout(this.expiryTimers.get(service));
        }

        // Set new timer
        const timer = setTimeout(() => {
            console.log(`API key for ${service} expired and removed`);
            this.keys.delete(service);
            this.saveKeysToStorage();
            this.expiryTimers.delete(service);

            // Update UI if needed
            if (window.updateStatusIndicator) {
                window.updateStatusIndicator();
            }
        }, CONFIG.SECURITY.KEY_EXPIRY_TIME);

        this.expiryTimers.set(service, timer);
    }

    /**
     * Save keys to localStorage
     */
    saveKeysToStorage() {
        try {
            const keysToSave = {};
            for (const [service, keyData] of this.keys) {
                keysToSave[service] = {
                    value: keyData.value,
                    timestamp: keyData.timestamp
                };
            }

            localStorage.setItem('ai_sales_training_keys', JSON.stringify(keysToSave));
        } catch (error) {
            console.error('Failed to save keys to localStorage:', error);
        }
    }

    /**
     * Load keys from localStorage
     */
    loadKeysFromStorage() {
        try {
            const savedKeys = localStorage.getItem('ai_sales_training_keys');
            if (!savedKeys) return;

            const keysData = JSON.parse(savedKeys);

            for (const [service, keyData] of Object.entries(keysData)) {
                this.keys.set(service, {
                    value: keyData.value,
                    timestamp: keyData.timestamp,
                    validated: false
                });

                // Set expiry timer for loaded keys
                this.setExpiryTimer(service);
            }

            console.log('Keys loaded from localStorage');
        } catch (error) {
            console.error('Failed to load keys from localStorage:', error);
        }
    }

    /**
     * Clear all keys and timers
     */
    clearAll() {
        // Clear all timers
        for (const timer of this.expiryTimers.values()) {
            clearTimeout(timer);
        }
        this.expiryTimers.clear();

        // Clear all keys
        this.keys.clear();

        // Clear localStorage
        localStorage.removeItem('ai_sales_training_keys');

        console.log('All keys cleared');
    }

    /**
     * Get key expiry time remaining (in milliseconds)
     */
    getKeyExpiryTime(service) {
        const keyData = this.keys.get(service);
        if (!keyData) return 0;

        const elapsed = Date.now() - keyData.timestamp;
        return Math.max(0, CONFIG.SECURITY.KEY_EXPIRY_TIME - elapsed);
    }
}

// Create global instance
const secureKeyManager = new SecureKeyManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureKeyManager;
} else {
    window.SecureKeyManager = SecureKeyManager;
    window.secureKeyManager = secureKeyManager;
}