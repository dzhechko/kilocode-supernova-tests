/**
 * API Keys Setup Interface
 * Handles the API keys modal and validation
 * Version 2.0 - Enhanced with Agent ID support
 */

class ApiKeysSetup {
    constructor() {
        this.modal = null;
        this.form = null;
        this.isValidating = false;

        this.init();
    }

    /**
     * Initialize the API keys setup
     */
    init() {
        this.modal = document.getElementById('api-keys-modal');
        this.form = {
            elevenLabsKey: document.getElementById('elevenlabs-api-key'),
            agentId: document.getElementById('elevenlabs-agent-id'),
            openaiKey: document.getElementById('openai-api-key')
        };

        this.setupEventListeners();
        this.updateFormState();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Test buttons
        const testElevenLabsBtn = document.getElementById('test-elevenlabs-btn');
        if (testElevenLabsBtn) {
            testElevenLabsBtn.addEventListener('click', () => this.testElevenLabsKey());
        }

        const testAgentBtn = document.getElementById('test-agent-btn');
        if (testAgentBtn) {
            testAgentBtn.addEventListener('click', () => this.testAgentId());
        }

        const testOpenaiBtn = document.getElementById('test-openai-btn');
        if (testOpenaiBtn) {
            testOpenaiBtn.addEventListener('click', () => this.testOpenaiKey());
        }

        // Input validation
        Object.values(this.form).forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.updateFormState());
                input.addEventListener('blur', () => this.validateInput(input));
            }
        });

        // Global key status updates
        setInterval(() => {
            this.updateFormState();
        }, 1000);
    }

    /**
     * Update form state based on current values
     */
    updateFormState() {
        if (this.isValidating) return;

        const keyStatus = secureKeyManager.getKeyStatus();

        // Update status indicators
        this.updateKeyStatus('elevenlabs', this.form.elevenLabsKey?.value || '');
        this.updateKeyStatus('agent', this.form.agentId?.value || '');
        this.updateKeyStatus('openai', this.form.openaiKey?.value || '');

        // Update save button
        const saveBtn = document.getElementById('save-keys-btn');
        if (saveBtn) {
            const hasOpenAI = this.form.openaiKey?.value?.length >= 48;
            saveBtn.disabled = !hasOpenAI;
        }
    }

    /**
     * Update key status display
     */
    updateKeyStatus(service, value) {
        const statusElement = document.getElementById(`${service}-status`);
        if (!statusElement) return;

        if (!value) {
            statusElement.textContent = '';
            statusElement.className = 'key-status';
            return;
        }

        // Check if key is already stored and validated
        const isStored = secureKeyManager.keys.has(service);
        if (isStored) {
            const keyData = secureKeyManager.keys.get(service);
            if (keyData.validated) {
                statusElement.textContent = '✓ Ключ сохранен и проверен';
                statusElement.className = 'key-status success';
                return;
            }
        }

        // Real-time validation
        try {
            secureKeyManager.validateKeyFormat(service, value);

            if (service === 'elevenlabs' && value.startsWith('sk_')) {
                statusElement.textContent = 'Формат ключа корректный';
                statusElement.className = 'key-status success';
            } else if (service === 'openai' && value.startsWith('sk-') && value.length >= 48) {
                statusElement.textContent = 'Формат ключа корректный';
                statusElement.className = 'key-status success';
            } else if (service === 'agent' && (value.length >= 20 || value.includes('-'))) {
                statusElement.textContent = 'Формат Agent ID корректный';
                statusElement.className = 'key-status success';
            } else {
                statusElement.textContent = 'Проверьте формат ключа';
                statusElement.className = 'key-status error';
            }
        } catch (error) {
            statusElement.textContent = error.message;
            statusElement.className = 'key-status error';
        }
    }

    /**
     * Validate input field
     */
    validateInput(input) {
        if (!input || !input.value) return;

        const service = this.getServiceFromInput(input);
        if (!service) return;

        try {
            secureKeyManager.validateKeyFormat(service, input.value);
            input.style.borderColor = 'var(--success-color)';
        } catch (error) {
            input.style.borderColor = 'var(--error-color)';
        }
    }

    /**
     * Get service name from input element
     */
    getServiceFromInput(input) {
        if (input === this.form.elevenLabsKey) return 'elevenlabs';
        if (input === this.form.agentId) return 'agent';
        if (input === this.form.openaiKey) return 'openai';
        return null;
    }

    /**
     * Test ElevenLabs API key
     */
    async testElevenLabsKey() {
        const input = this.form.elevenLabsKey;
        if (!input || !input.value) {
            alert('Введите ElevenLabs API ключ для тестирования');
            return;
        }

        this.isValidating = true;
        const testBtn = document.getElementById('test-elevenlabs-btn');
        const statusElement = document.getElementById('elevenlabs-status');

        // Update UI
        if (testBtn) testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        if (statusElement) {
            statusElement.textContent = 'Проверка ключа...';
            statusElement.className = 'key-status';
        }

        try {
            const isValid = await secureKeyManager.testKey('elevenlabs', input.value);

            if (isValid) {
                if (statusElement) {
                    statusElement.textContent = '✓ ElevenLabs API ключ действителен';
                    statusElement.className = 'key-status success';
                }
                input.style.borderColor = 'var(--success-color)';
            } else {
                if (statusElement) {
                    statusElement.textContent = '✗ ElevenLabs API ключ недействителен';
                    statusElement.className = 'key-status error';
                }
                input.style.borderColor = 'var(--error-color)';
            }
        } catch (error) {
            console.error('ElevenLabs key test error:', error);
            if (statusElement) {
                statusElement.textContent = '✗ Ошибка при проверке ключа';
                statusElement.className = 'key-status error';
            }
            input.style.borderColor = 'var(--error-color)';
        } finally {
            this.isValidating = false;
            if (testBtn) testBtn.innerHTML = '<i class="fas fa-vial"></i>';
        }
    }

    /**
     * Test Agent ID
     */
    async testAgentId() {
        const input = this.form.agentId;
        if (!input || !input.value) {
            alert('Введите ElevenLabs Agent ID для тестирования');
            return;
        }

        this.isValidating = true;
        const testBtn = document.getElementById('test-agent-btn');
        const statusElement = document.getElementById('agent-status');

        // Update UI
        if (testBtn) testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        if (statusElement) {
            statusElement.textContent = 'Проверка Agent ID...';
            statusElement.className = 'key-status';
        }

        try {
            const isValid = await secureKeyManager.testKey('agent', input.value);

            if (isValid) {
                if (statusElement) {
                    statusElement.textContent = '✓ Agent ID формат корректный';
                    statusElement.className = 'key-status success';
                }
                input.style.borderColor = 'var(--success-color)';
            } else {
                if (statusElement) {
                    statusElement.textContent = '✗ Agent ID формат некорректный';
                    statusElement.className = 'key-status error';
                }
                input.style.borderColor = 'var(--error-color)';
            }
        } catch (error) {
            console.error('Agent ID test error:', error);
            if (statusElement) {
                statusElement.textContent = '✗ Ошибка при проверке Agent ID';
                statusElement.className = 'key-status error';
            }
            input.style.borderColor = 'var(--error-color)';
        } finally {
            this.isValidating = false;
            if (testBtn) testBtn.innerHTML = '<i class="fas fa-vial"></i>';
        }
    }

    /**
     * Test OpenAI API key
     */
    async testOpenaiKey() {
        const input = this.form.openaiKey;
        if (!input || !input.value) {
            alert('Введите OpenAI API ключ для тестирования');
            return;
        }

        this.isValidating = true;
        const testBtn = document.getElementById('test-openai-btn');
        const statusElement = document.getElementById('openai-status');

        // Update UI
        if (testBtn) testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        if (statusElement) {
            statusElement.textContent = 'Проверка ключа...';
            statusElement.className = 'key-status';
        }

        try {
            const isValid = await secureKeyManager.testKey('openai', input.value);

            if (isValid) {
                if (statusElement) {
                    statusElement.textContent = '✓ OpenAI API ключ действителен';
                    statusElement.className = 'key-status success';
                }
                input.style.borderColor = 'var(--success-color)';
            } else {
                if (statusElement) {
                    statusElement.textContent = '✗ OpenAI API ключ недействителен';
                    statusElement.className = 'key-status error';
                }
                input.style.borderColor = 'var(--error-color)';
            }
        } catch (error) {
            console.error('OpenAI key test error:', error);
            if (statusElement) {
                statusElement.textContent = '✗ Ошибка при проверке ключа';
                statusElement.className = 'key-status error';
            }
            input.style.borderColor = 'var(--error-color)';
        } finally {
            this.isValidating = false;
            if (testBtn) testBtn.innerHTML = '<i class="fas fa-vial"></i>';
        }
    }

    /**
     * Get form data
     */
    getFormData() {
        return {
            elevenLabsKey: this.form.elevenLabsKey?.value || '',
            agentId: this.form.agentId?.value || '',
            openaiKey: this.form.openaiKey?.value || ''
        };
    }

    /**
     * Set form data
     */
    setFormData(data) {
        if (data.elevenLabsKey && this.form.elevenLabsKey) {
            this.form.elevenLabsKey.value = data.elevenLabsKey;
        }
        if (data.agentId && this.form.agentId) {
            this.form.agentId.value = data.agentId;
        }
        if (data.openaiKey && this.form.openaiKey) {
            this.form.openaiKey.value = data.openaiKey;
        }
        this.updateFormState();
    }

    /**
     * Clear form
     */
    clearForm() {
        Object.values(this.form).forEach(input => {
            if (input) input.value = '';
        });
        this.updateFormState();
    }

    /**
     * Show help for getting API keys
     */
    showApiKeysHelp() {
        const helpText = `
ИНСТРУКЦИЯ ПО ПОЛУЧЕНИЮ API КЛЮЧЕЙ:

1. ElevenLabs API Key:
   - Перейдите на https://elevenlabs.io
   - Зарегистрируйтесь или войдите в аккаунт
   - Перейдите в раздел "Profile" → "API Keys"
   - Создайте новый API ключ
   - Скопируйте ключ (начинается с "sk_" или "sk-")

2. ElevenLabs Agent ID:
   - В ElevenLabs перейдите в раздел "Agents"
   - Создайте нового агента или выберите существующего
   - Скопируйте Agent ID из URL или настроек агента
   - Agent ID может быть в формате UUID или строки

3. OpenAI API Key:
   - Перейдите на https://platform.openai.com
   - Зарегистрируйтесь или войдите в аккаунт
   - Перейдите в раздел "API Keys"
   - Создайте новый секретный ключ
   - Скопируйте ключ (начинается с "sk-")

ВАЖНО:
- Храните ключи в безопасном месте
- Не делитесь ключами с другими
- Ключи действительны в течение сессии (30 минут)
- OpenAI ключ обязателен для анализа разговоров
        `.trim();

        alert(helpText);
    }

    /**
     * Show validation errors
     */
    showValidationErrors(errors) {
        const errorMessages = errors.map(error => `• ${error}`).join('\n');
        alert('Обнаружены ошибки валидации:\n\n' + errorMessages);
    }

    /**
     * Validate all form fields
     */
    validateForm() {
        const errors = [];
        const data = this.getFormData();

        // Validate OpenAI key (required)
        if (!data.openaiKey) {
            errors.push('OpenAI API ключ обязателен');
        } else {
            try {
                secureKeyManager.validateKeyFormat('openai', data.openaiKey);
            } catch (error) {
                errors.push(`OpenAI API ключ: ${error.message}`);
            }
        }

        // Validate ElevenLabs key (optional)
        if (data.elevenLabsKey) {
            try {
                secureKeyManager.validateKeyFormat('elevenlabs', data.elevenLabsKey);
            } catch (error) {
                errors.push(`ElevenLabs API ключ: ${error.message}`);
            }
        }

        // Validate Agent ID (optional)
        if (data.agentId) {
            try {
                secureKeyManager.validateKeyFormat('agent', data.agentId);
            } catch (error) {
                errors.push(`Agent ID: ${error.message}`);
            }
        }

        return errors;
    }
}

// Create global instance
const apiKeysSetup = new ApiKeysSetup();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiKeysSetup;
} else {
    window.ApiKeysSetup = ApiKeysSetup;
    window.apiKeysSetup = apiKeysSetup;
}