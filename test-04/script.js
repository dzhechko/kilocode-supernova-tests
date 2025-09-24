/**
 * AI Sales Training Platform - Main Application Logic
 * Version 2.0 - Dual-mode conversation system with real-time analysis
 */

class SalesTrainingApp {
    constructor() {
        this.currentMode = null; // 'agent' or 'traditional'
        this.conversationActive = false;
        this.recognition = null;
        this.synthesis = null;
        this.isListening = false;
        this.conversationHistory = [];
        this.currentScenario = null;
        this.currentStep = 0;
        this.analysisResults = null;

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing AI Sales Training Platform v2.0');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }

        // Initialize speech recognition if available
        this.initSpeechRecognition();

        // Initialize speech synthesis
        this.initSpeechSynthesis();

        // Update status indicator
        this.updateStatusIndicator();

        console.log('Application initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // API Keys button
        const apiKeysBtn = document.getElementById('api-keys-btn');
        if (apiKeysBtn) {
            apiKeysBtn.addEventListener('click', () => this.showApiKeysModal());
        }

        // Mode selection buttons
        const agentModeBtn = document.getElementById('agent-mode-btn');
        if (agentModeBtn) {
            agentModeBtn.addEventListener('click', () => this.startAgentMode());
        }

        const traditionalModeBtn = document.getElementById('traditional-mode-btn');
        if (traditionalModeBtn) {
            traditionalModeBtn.addEventListener('click', () => this.startTraditionalMode());
        }

        // Conversation controls
        const endConversationBtn = document.getElementById('end-conversation-btn');
        if (endConversationBtn) {
            endConversationBtn.addEventListener('click', () => this.endConversation());
        }

        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());
        }

        const sendBtn = document.getElementById('send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        const textInput = document.getElementById('text-input');
        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Results controls
        const newTrainingBtn = document.getElementById('new-training-btn');
        if (newTrainingBtn) {
            newTrainingBtn.addEventListener('click', () => this.startNewTraining());
        }

        // Modal controls
        const closeModalBtn = document.getElementById('close-modal-btn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideApiKeysModal());
        }

        const skipDemoBtn = document.getElementById('skip-demo-btn');
        if (skipDemoBtn) {
            skipDemoBtn.addEventListener('click', () => this.skipDemo());
        }

        const saveKeysBtn = document.getElementById('save-keys-btn');
        if (saveKeysBtn) {
            saveKeysBtn.addEventListener('click', () => this.saveApiKeys());
        }

        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        // Set up global functions for other modules
        window.updateStatusIndicator = () => this.updateStatusIndicator();
        window.showLoading = (text) => this.showLoading(text);
        window.hideLoading = () => this.hideLoading();
    }

    /**
     * Update status indicator based on available keys
     */
    updateStatusIndicator() {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const statusBadge = document.getElementById('status-badge');

        if (!statusIndicator || !statusText || !statusBadge) return;

        const keyStatus = secureKeyManager.getKeyStatus();

        switch (keyStatus.level) {
            case 'full':
                statusIndicator.className = 'status-indicator success';
                statusText.textContent = `Режим "${keyStatus.mode === 'agent' ? 'Агента' : 'Традиционный'}" готов к работе`;
                statusBadge.textContent = keyStatus.mode === 'agent' ? '🤖 Agent' : '✅ Traditional';
                statusBadge.className = 'status-badge success';
                break;

            case 'partial':
                statusIndicator.className = 'status-indicator warning';
                statusText.textContent = 'Настроены не все API ключи';
                statusBadge.textContent = '⚠️ Partial';
                statusBadge.className = 'status-badge warning';
                break;

            default:
                statusIndicator.className = 'status-indicator info';
                statusText.textContent = 'Настройте API ключи для начала работы';
                statusBadge.textContent = '🔑 No Keys';
                statusBadge.className = 'status-badge info';
        }

        // Update mode button states
        this.updateModeButtons(keyStatus);
    }

    /**
     * Update mode button states
     */
    updateModeButtons(keyStatus) {
        const agentModeBtn = document.getElementById('agent-mode-btn');
        const traditionalModeBtn = document.getElementById('traditional-mode-btn');

        if (agentModeBtn) {
            agentModeBtn.disabled = keyStatus.mode !== 'agent';
        }

        if (traditionalModeBtn) {
            traditionalModeBtn.disabled = keyStatus.mode !== 'traditional' && keyStatus.mode !== 'agent';
        }
    }

    /**
     * Show API keys modal
     */
    showApiKeysModal() {
        const modal = document.getElementById('api-keys-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide API keys modal
     */
    hideApiKeysModal() {
        const modal = document.getElementById('api-keys-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Save API keys
     */
    async saveApiKeys() {
        const elevenLabsKey = document.getElementById('elevenlabs-api-key').value;
        const agentId = document.getElementById('elevenlabs-agent-id').value;
        const openaiKey = document.getElementById('openai-api-key').value;

        if (!openaiKey) {
            alert('OpenAI API ключ обязателен для работы платформы');
            return;
        }

        this.showLoading('Сохранение API ключей...');

        try {
            // Store keys securely
            if (elevenLabsKey) {
                await secureKeyManager.storeKey('elevenlabs', elevenLabsKey);
            }

            if (agentId) {
                await secureKeyManager.storeKey('agent', agentId);
            }

            if (openaiKey) {
                await secureKeyManager.storeKey('openai', openaiKey);
            }

            // Set keys in modules
            if (elevenLabsKey) {
                elevenLabsAgent.setApiKey(elevenLabsKey);
            }

            if (agentId) {
                elevenLabsAgent.setAgentId(agentId);
            }

            if (openaiKey) {
                conversationAnalyzer.setApiKey(openaiKey);
            }

            this.hideApiKeysModal();
            this.updateStatusIndicator();

            alert('API ключи успешно сохранены!');
        } catch (error) {
            console.error('Failed to save API keys:', error);
            alert('Ошибка при сохранении API ключей: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Skip demo mode
     */
    skipDemo() {
        this.hideApiKeysModal();
        this.updateStatusIndicator();
    }

    /**
     * Start Agent Mode
     */
    async startAgentMode() {
        if (this.conversationActive) {
            return;
        }

        this.showLoading('Подключение к AI агенту...');

        try {
            // Initialize ElevenLabs Agent
            await elevenLabsAgent.initAgentMode();

            // Set up event listeners
            elevenLabsAgent.setTranscriptCallback((transcript) => {
                this.conversationHistory = transcript;
            });

            elevenLabsAgent.on('connected', () => {
                this.startConversation('agent');
            });

            elevenLabsAgent.on('error', (error) => {
                console.error('Agent error:', error);
                alert('Ошибка подключения к агенту: ' + error.message);
                this.hideLoading();
            });

        } catch (error) {
            console.error('Failed to start Agent Mode:', error);
            alert('Не удалось запустить режим агента: ' + error.message);
            this.hideLoading();
        }
    }

    /**
     * Start Traditional Mode
     */
    async startTraditionalMode() {
        if (this.conversationActive) {
            return;
        }

        this.showLoading('Инициализация традиционного режима...');

        try {
            // Initialize ElevenLabs Traditional Mode
            await elevenLabsAgent.initTraditionalMode();

            // Select a scenario
            this.selectScenario();

            this.startConversation('traditional');
        } catch (error) {
            console.error('Failed to start Traditional Mode:', error);
            alert('Не удалось запустить традиционный режим: ' + error.message);
            this.hideLoading();
        }
    }

    /**
     * Start conversation
     */
    startConversation(mode) {
        this.currentMode = mode;
        this.conversationActive = true;
        this.conversationHistory = [];
        this.currentStep = 0;

        // Update UI
        this.showConversationArea();
        this.updateConversationTitle();

        // Start voice recognition if available
        if (this.recognition && CONFIG.FEATURES.ENABLE_VOICE_RECOGNITION) {
            this.startVoiceRecognition();
        }

        this.hideLoading();
        console.log(`Conversation started in ${mode} mode`);
    }

    /**
     * End conversation
     */
    async endConversation() {
        if (!this.conversationActive) {
            return;
        }

        this.showLoading('Завершение разговора...');

        try {
            // End ElevenLabs conversation
            if (elevenLabsAgent) {
                elevenLabsAgent.endConversation();
            }

            // Stop voice recognition
            this.stopVoiceRecognition();

            // Analyze conversation
            await this.analyzeConversation();

            // Show results
            this.showResultsArea();

        } catch (error) {
            console.error('Error ending conversation:', error);
            alert('Ошибка при завершении разговора: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Analyze conversation
     */
    async analyzeConversation() {
        if (this.conversationHistory.length === 0) {
            console.log('No conversation data to analyze');
            return;
        }

        this.showLoading('Анализ разговора...');

        try {
            const analysisData = {
                mode: this.currentMode,
                messages: this.conversationHistory,
                timestamp: Date.now(),
                duration: Date.now() - this.conversationStartTime
            };

            this.analysisResults = await conversationAnalyzer.analyzeConversation(analysisData, this.currentMode);
            console.log('Conversation analysis completed:', this.analysisResults);

        } catch (error) {
            console.error('Conversation analysis failed:', error);
            this.analysisResults = conversationAnalyzer.getFallbackAnalysis();
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Show conversation area
     */
    showConversationArea() {
        const modeSelection = document.querySelector('.mode-selection');
        const conversationArea = document.getElementById('conversation-area');

        if (modeSelection) modeSelection.style.display = 'none';
        if (conversationArea) conversationArea.style.display = 'block';
    }

    /**
     * Show results area
     */
    showResultsArea() {
        const conversationArea = document.getElementById('conversation-area');
        const resultsArea = document.getElementById('results-area');

        if (conversationArea) conversationArea.style.display = 'none';
        if (resultsArea) resultsArea.style.display = 'block';

        this.displayAnalysisResults();
    }

    /**
     * Display analysis results
     */
    displayAnalysisResults() {
        if (!this.analysisResults) return;

        // Update overall score
        const overallScoreElement = document.getElementById('overall-score');
        if (overallScoreElement) {
            overallScoreElement.textContent = this.analysisResults.overall_score;
        }

        // Update score description
        const scoreDescriptionElement = document.getElementById('score-description');
        if (scoreDescriptionElement) {
            const score = this.analysisResults.overall_score;
            if (score >= 90) {
                scoreDescriptionElement.textContent = 'Отличный результат!';
            } else if (score >= 75) {
                scoreDescriptionElement.textContent = 'Хороший результат';
            } else if (score >= 60) {
                scoreDescriptionElement.textContent = 'Удовлетворительный результат';
            } else {
                scoreDescriptionElement.textContent = 'Требует улучшения';
            }
        }

        // Display criteria scores
        this.displayCriteriaScores();

        // Display recommendations
        this.displayRecommendations();
    }

    /**
     * Display criteria scores
     */
    displayCriteriaScores() {
        const criteriaContainer = document.getElementById('criteria-scores');
        if (!criteriaContainer || !this.analysisResults) return;

        criteriaContainer.innerHTML = '';

        Object.entries(this.analysisResults.criteria_scores).forEach(([criterion, score]) => {
            const criterionElement = document.createElement('div');
            criterionElement.className = 'criterion-score';
            criterionElement.innerHTML = `
                <div class="criterion-name">${CONFIG.SCORING_CRITERIA[criterion]?.name || criterion}</div>
                <div class="criterion-value">
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${score}%"></div>
                    </div>
                    <span class="score-number">${score}</span>
                </div>
            `;
            criteriaContainer.appendChild(criterionElement);
        });
    }

    /**
     * Display recommendations
     */
    displayRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations-content');
        if (!recommendationsContainer || !this.analysisResults) return;

        recommendationsContainer.innerHTML = '';

        if (this.analysisResults.recommendations && this.analysisResults.recommendations.length > 0) {
            this.analysisResults.recommendations.forEach(rec => {
                const recElement = document.createElement('div');
                recElement.className = 'recommendation-item';
                recElement.innerHTML = `
                    <i class="fas fa-lightbulb"></i>
                    <span>${rec}</span>
                `;
                recommendationsContainer.appendChild(recElement);
            });
        } else {
            recommendationsContainer.innerHTML = '<p>Рекомендации не доступны</p>';
        }
    }

    /**
     * Start new training
     */
    startNewTraining() {
        // Reset state
        this.conversationActive = false;
        this.currentMode = null;
        this.conversationHistory = [];
        this.analysisResults = null;
        this.currentStep = 0;
        this.currentScenario = null;

        // Update UI
        const resultsArea = document.getElementById('results-area');
        const modeSelection = document.querySelector('.mode-selection');

        if (resultsArea) resultsArea.style.display = 'none';
        if (modeSelection) modeSelection.style.display = 'block';

        // Clear conversation area
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-text">Добро пожаловать в AI Sales Training! Я готов помочь вам улучшить навыки продаж. Выберите режим и начнем тренировку.</div>
                        <div class="message-time">Сейчас</div>
                    </div>
                </div>
            `;
        }

        this.updateStatusIndicator();
    }

    /**
     * Select scenario for traditional mode
     */
    selectScenario() {
        // For now, select the first available scenario
        const scenarioKeys = Object.keys(CONFIG.SCENARIOS);
        if (scenarioKeys.length > 0) {
            this.currentScenario = CONFIG.SCENARIOS[scenarioKeys[0]];
            console.log('Selected scenario:', this.currentScenario.name);
        }
    }

    /**
     * Update conversation title
     */
    updateConversationTitle() {
        const titleElement = document.getElementById('conversation-title');
        if (!titleElement) return;

        if (this.currentMode === 'agent') {
            titleElement.textContent = '🤖 Режим Агента - Живое общение';
        } else if (this.currentMode === 'traditional') {
            titleElement.textContent = `✅ ${this.currentScenario?.name || 'Традиционный режим'}`;
        }
    }

    /**
     * Send message
     */
    async sendMessage() {
        const textInput = document.getElementById('text-input');
        if (!textInput || !textInput.value.trim()) return;

        const message = textInput.value.trim();
        textInput.value = '';

        // Add user message to UI
        this.addMessage('user', message);

        if (this.currentMode === 'agent') {
            // Send to ElevenLabs Agent
            elevenLabsAgent.sendMessage(message);
        } else if (this.currentMode === 'traditional') {
            // Handle traditional mode
            await this.handleTraditionalModeResponse(message);
        }
    }

    /**
     * Handle traditional mode response
     */
    async handleTraditionalModeResponse(message) {
        // Add user message to history
        this.conversationHistory.push({
            speaker: 'user',
            text: message,
            timestamp: Date.now()
        });

        // Get AI response
        if (this.currentScenario && this.currentScenario.steps[this.currentStep]) {
            const currentStep = this.currentScenario.steps[this.currentStep];

            // Simulate AI thinking
            await this.delay(1000);

            // Add AI response
            this.addMessage('ai', currentStep.content);

            // Move to next step
            this.currentStep++;
        }
    }

    /**
     * Add message to conversation
     */
    addMessage(speaker, text) {
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${speaker}-message`;

        const avatarIcon = speaker === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const speakerName = speaker === 'user' ? 'Вы' : 'AI Агент';

        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-sender">${speakerName}</div>
                <div class="message-text">${text}</div>
                <div class="message-time">${new Date().toLocaleTimeString('ru-RU')}</div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Initialize speech recognition
     */
    initSpeechRecognition() {
        if (!CONFIG.FEATURES.ENABLE_VOICE_RECOGNITION) {
            console.log('Voice recognition disabled');
            return;
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButton();
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('Voice recognition result:', transcript);

                const textInput = document.getElementById('text-input');
                if (textInput) {
                    textInput.value = transcript;
                }

                this.sendMessage();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceButton();

                if (event.error === 'not-allowed') {
                    alert('Доступ к микрофону запрещен. Разрешите доступ для голосового ввода.');
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton();
            };

            console.log('Speech recognition initialized');
        } else {
            console.log('Speech recognition not supported');
        }
    }

    /**
     * Initialize speech synthesis
     */
    initSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            console.log('Speech synthesis initialized');
        } else {
            console.log('Speech synthesis not supported');
        }
    }

    /**
     * Toggle voice recognition
     */
    toggleVoiceRecognition() {
        if (!this.recognition) {
            alert('Распознавание речи не поддерживается в вашем браузере');
            return;
        }

        if (this.isListening) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }

    /**
     * Start voice recognition
     */
    startVoiceRecognition() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
            }
        }
    }

    /**
     * Stop voice recognition
     */
    stopVoiceRecognition() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping voice recognition:', error);
            }
        }
    }

    /**
     * Update voice button state
     */
    updateVoiceButton() {
        const voiceBtn = document.getElementById('voice-btn');
        if (!voiceBtn) return;

        if (this.isListening) {
            voiceBtn.className = 'btn btn-danger';
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        } else {
            voiceBtn.className = 'btn btn-outline';
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    }

    /**
     * Show loading overlay
     */
    showLoading(text = 'Загрузка...') {
        const overlay = document.getElementById('loading-overlay');
        const textElement = document.getElementById('loading-text');

        if (overlay) overlay.style.display = 'flex';
        if (textElement) textElement.textContent = text;
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    /**
     * Show help
     */
    showHelp() {
        alert('Помощь по использованию:\n\n1. Настройте API ключи в разделе "API Keys"\n2. Выберите режим тренировки\n3. Начните разговор\n4. Получите детальный анализ навыков продаж');
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
const salesTrainingApp = new SalesTrainingApp();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SalesTrainingApp;
} else {
    window.SalesTrainingApp = SalesTrainingApp;
    window.salesTrainingApp = salesTrainingApp;
}