/**
 * AI Sales Training Platform Configuration
 * Version 2.0 - ElevenLabs Agent Integration
 * Now reads from environment variables with fallback defaults
 */

// Environment variable loader
function getEnvVar(key, defaultValue) {
    // Try to get from environment variables (for Node.js)
    if (typeof process !== 'undefined' && process.env) {
        const value = process.env[key];
        if (value !== undefined) {
            return value;
        }
    }

    // Try to get from window.ENV (for browser with injected env)
    if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
        return window.ENV[key];
    }

    // Try to get from .env file (for development)
    try {
        if (typeof localStorage !== 'undefined') {
            const envData = localStorage.getItem('env_config');
            if (envData) {
                const parsed = JSON.parse(envData);
                if (parsed[key]) {
                    return parsed[key];
                }
            }
        }
    } catch (error) {
        console.warn('Failed to load env config from localStorage:', error);
    }

    return defaultValue;
}

// Parse boolean from environment variable
function getEnvBoolean(key, defaultValue) {
    const value = getEnvVar(key, defaultValue.toString());
    return value === 'true' || value === '1' || value === 'yes';
}

// Parse number from environment variable
function getEnvNumber(key, defaultValue) {
    const value = getEnvVar(key, defaultValue.toString());
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

// Parse array from comma-separated string
function getEnvArray(key, defaultValue) {
    const value = getEnvVar(key, defaultValue.join(','));
    return value.split(',').map(item => item.trim());
}

const CONFIG = {
    // Application Settings
    APP_NAME: getEnvVar('APP_NAME', 'AI Sales Training Platform'),
    VERSION: getEnvVar('APP_VERSION', '2.0.0'),
    LANGUAGE: getEnvVar('APP_LANGUAGE', 'ru'),

    // API Endpoints
    APIS: {
        ELEVENLABS: {
            BASE_URL: getEnvVar('ELEVENLABS_BASE_URL', 'https://api.elevenlabs.io'),
            TTS_ENDPOINT: getEnvVar('ELEVENLABS_TTS_ENDPOINT', '/v1/text-to-speech'),
            CONVERSATIONS_ENDPOINT: getEnvVar('ELEVENLABS_CONVERSATIONS_ENDPOINT', '/v1/convai/conversations'),
            AGENT_ENDPOINT: getEnvVar('ELEVENLABS_AGENT_ENDPOINT', '/v1/convai/conversation')
        },
        OPENAI: {
            BASE_URL: getEnvVar('OPENAI_BASE_URL', 'https://api.openai.com'),
            COMPLETIONS_ENDPOINT: getEnvVar('OPENAI_COMPLETIONS_ENDPOINT', '/v1/chat/completions'),
            MODEL: getEnvVar('OPENAI_MODEL', 'gpt-4-turbo-preview')
        }
    },

    // Conversation Settings
    CONVERSATION: {
        MAX_DURATION: getEnvNumber('CONVERSATION_MAX_DURATION', 30 * 60 * 1000), // 30 minutes
        TYPING_DELAY: getEnvNumber('CONVERSATION_TYPING_DELAY', 1000), // 1 second
        VOICE_TIMEOUT: getEnvNumber('CONVERSATION_VOICE_TIMEOUT', 5000), // 5 seconds
        RETRY_ATTEMPTS: getEnvNumber('CONVERSATION_RETRY_ATTEMPTS', 3)
    },

    // Sales Training Scenarios
    SCENARIOS: {
        'software_sale': {
            id: 'software_sale',
            name: 'Продажа ПО',
            description: 'Продажа корпоративного программного обеспечения',
            steps: [
                {
                    id: 'greeting',
                    type: 'ai_initiate',
                    content: 'Здравствуйте! Я представляю компанию TechSolutions. Мы специализируемся на корпоративном ПО для автоматизации бизнес-процессов. Расскажите, пожалуйста, о вашем текущем программном обеспечении и какие задачи вы хотели бы оптимизировать?'
                },
                {
                    id: 'needs_analysis',
                    type: 'user_response',
                    content: 'Выявление потребностей клиента'
                },
                {
                    id: 'solution_presentation',
                    type: 'ai_response',
                    content: 'Презентация решения'
                },
                {
                    id: 'objection_handling',
                    type: 'user_response',
                    content: 'Обработка возражений'
                },
                {
                    id: 'closing',
                    type: 'ai_response',
                    content: 'Завершение сделки'
                }
            ]
        },
        'consulting_services': {
            id: 'consulting_services',
            name: 'Консалтинговые услуги',
            description: 'Продажа услуг бизнес-консультирования',
            steps: [
                {
                    id: 'initial_contact',
                    type: 'ai_initiate',
                    content: 'Добрый день! Я из консалтинговой компании BusinessPro. Мы помогаем компаниям оптимизировать операционные процессы и повышать эффективность. Могу ли я узнать больше о вашем бизнесе и текущих вызовах?'
                },
                {
                    id: 'problem_identification',
                    type: 'user_response',
                    content: 'Идентификация проблем'
                },
                {
                    id: 'expertise_demonstration',
                    type: 'ai_response',
                    content: 'Демонстрация экспертизы'
                },
                {
                    id: 'proposal_presentation',
                    type: 'user_response',
                    content: 'Презентация предложения'
                },
                {
                    id: 'negotiation',
                    type: 'ai_response',
                    content: 'Переговоры и закрытие'
                }
            ]
        }
    },

    // Scoring Criteria
    SCORING_CRITERIA: {
        'communication_skills': {
            name: 'Коммуникативные навыки',
            weight: getEnvNumber('SCORING_COMMUNICATION_SKILLS', 0.25),
            description: 'Ясность речи, активное слушание, эмпатия'
        },
        'product_knowledge': {
            name: 'Знание продукта',
            weight: getEnvNumber('SCORING_PRODUCT_KNOWLEDGE', 0.20),
            description: 'Глубина понимания продукта/услуги, уверенность'
        },
        'objection_handling': {
            name: 'Обработка возражений',
            weight: getEnvNumber('SCORING_OBJECTION_HANDLING', 0.20),
            description: 'Эффективность в преодолении сомнений клиента'
        },
        'closing_techniques': {
            name: 'Техники закрытия',
            weight: getEnvNumber('SCORING_CLOSING_TECHNIQUES', 0.20),
            description: 'Умение привести к принятию решения'
        },
        'relationship_building': {
            name: 'Построение отношений',
            weight: getEnvNumber('SCORING_RELATIONSHIP_BUILDING', 0.15),
            description: 'Создание доверия и долгосрочных отношений'
        }
    },

    // UI Settings
    UI: {
        THEME_COLORS: {
            primary: getEnvVar('UI_PRIMARY_COLOR', '#4f46e5'),
            secondary: getEnvVar('UI_SECONDARY_COLOR', '#059669'),
            success: getEnvVar('UI_SUCCESS_COLOR', '#10b981'),
            warning: getEnvVar('UI_WARNING_COLOR', '#f59e0b'),
            error: getEnvVar('UI_ERROR_COLOR', '#ef4444'),
            background: getEnvVar('UI_BACKGROUND_COLOR', '#f8fafc'),
            surface: getEnvVar('UI_SURFACE_COLOR', '#ffffff'),
            text: '#1f2937',
            textSecondary: '#6b7280'
        },
        BREAKPOINTS: {
            mobile: getEnvNumber('UI_MOBILE_BREAKPOINT', 768),
            tablet: getEnvNumber('UI_TABLET_BREAKPOINT', 1024),
            desktop: getEnvNumber('UI_DESKTOP_BREAKPOINT', 1280)
        },
        ANIMATION_DURATION: getEnvNumber('UI_ANIMATION_DURATION', 300)
    },

    // Security Settings
    SECURITY: {
        KEY_EXPIRY_TIME: getEnvNumber('SECURITY_KEY_EXPIRY_TIME', 30 * 60 * 1000), // 30 minutes
        MAX_KEY_LENGTH: getEnvNumber('SECURITY_MAX_KEY_LENGTH', 200),
        MIN_KEY_LENGTH: getEnvNumber('SECURITY_MIN_KEY_LENGTH', 20),
        ENCRYPTION_ENABLED: getEnvBoolean('SECURITY_ENCRYPTION_ENABLED', true)
    },

    // Feature Flags
    FEATURES: {
        ENABLE_VOICE_RECOGNITION: getEnvBoolean('FEATURE_VOICE_RECOGNITION', true),
        ENABLE_TEXT_TO_SPEECH: getEnvBoolean('FEATURE_TEXT_TO_SPEECH', true),
        ENABLE_REAL_TIME_ANALYSIS: getEnvBoolean('FEATURE_REAL_TIME_ANALYSIS', true),
        ENABLE_OFFLINE_MODE: getEnvBoolean('FEATURE_OFFLINE_MODE', true),
        ENABLE_EXPORT_RESULTS: getEnvBoolean('FEATURE_EXPORT_RESULTS', true)
    },

    // Error Messages
    ERRORS: {
        NO_API_KEYS: getEnvVar('ERROR_NO_API_KEYS', 'Необходимо настроить API ключи для работы с платформой'),
        INVALID_ELEVENLABS_KEY: getEnvVar('ERROR_INVALID_ELEVENLABS_KEY', 'Неверный формат ElevenLabs API ключа'),
        INVALID_OPENAI_KEY: getEnvVar('ERROR_INVALID_OPENAI_KEY', 'Неверный формат OpenAI API ключа'),
        INVALID_AGENT_ID: getEnvVar('ERROR_INVALID_AGENT_ID', 'Неверный формат ElevenLabs Agent ID'),
        NETWORK_ERROR: getEnvVar('ERROR_NETWORK_ERROR', 'Ошибка сети. Проверьте подключение к интернету'),
        VOICE_NOT_SUPPORTED: getEnvVar('ERROR_VOICE_NOT_SUPPORTED', 'Распознавание речи не поддерживается в вашем браузере'),
        MICROPHONE_DENIED: getEnvVar('ERROR_MICROPHONE_DENIED', 'Доступ к микрофону запрещен. Разрешите доступ для голосового ввода'),
        CONVERSATION_TIMEOUT: getEnvVar('ERROR_CONVERSATION_TIMEOUT', 'Время разговора истекло. Начните новую сессию'),
        ANALYSIS_FAILED: getEnvVar('ERROR_ANALYSIS_FAILED', 'Не удалось выполнить анализ разговора')
    },

    // Success Messages
    SUCCESS: {
        KEYS_SAVED: getEnvVar('SUCCESS_KEYS_SAVED', 'API ключи успешно сохранены'),
        CONVERSATION_STARTED: getEnvVar('SUCCESS_CONVERSATION_STARTED', 'Разговор начат. Удачи!'),
        ANALYSIS_COMPLETE: getEnvVar('SUCCESS_ANALYSIS_COMPLETE', 'Анализ разговора завершен'),
        RESULTS_EXPORTED: getEnvVar('SUCCESS_RESULTS_EXPORTED', 'Результаты экспортированы')
    },

    // Additional environment-based settings
    DEFAULT_VOICE_ID: getEnvVar('DEFAULT_VOICE_ID', '21m00Tcm4TlvDq8ikWAM'),
    PERFORMANCE: {
        PAGE_LOAD_TARGET: getEnvNumber('PERFORMANCE_PAGE_LOAD_TARGET', 3000),
        API_RESPONSE_TARGET: getEnvNumber('PERFORMANCE_API_RESPONSE_TARGET', 2000),
        MAX_MEMORY_USAGE: getEnvNumber('PERFORMANCE_MAX_MEMORY_USAGE', 100),
        TARGET_FPS: getEnvNumber('PERFORMANCE_TARGET_FPS', 60)
    },

    DEBUG: {
        ENABLED: getEnvBoolean('DEBUG_ENABLED', false),
        LOG_LEVEL: getEnvVar('DEBUG_LOG_LEVEL', 'info'),
        DEV_TOOLS: getEnvBoolean('DEBUG_DEV_TOOLS', false)
    },

    CACHE: {
        EXPIRY_TIME: getEnvNumber('CACHE_EXPIRY_TIME', 3600000),
        MAX_SIZE: getEnvNumber('CACHE_MAX_SIZE', 50),
        ANALYSIS_ENABLED: getEnvBoolean('CACHE_ANALYSIS_ENABLED', true)
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}