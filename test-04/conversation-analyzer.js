/**
 * Conversation Analyzer with GPT-4 Integration
 * Replaces mock data with real AI analysis
 * Version 2.0 - Full OpenAI GPT-4 integration
 */

class ConversationAnalyzer {
    constructor() {
        this.apiKey = null;
        this.conversationHistory = [];
        this.analysisCache = new Map();
    }

    /**
     * Set OpenAI API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Analyze conversation using GPT-4
     */
    async analyzeConversation(conversationData, mode = 'agent') {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not set');
        }

        // Create cache key
        const cacheKey = this.createCacheKey(conversationData, mode);

        // Check cache first
        if (this.analysisCache.has(cacheKey)) {
            console.log('Using cached analysis');
            return this.analysisCache.get(cacheKey);
        }

        try {
            const analysis = await this.performGPT4Analysis(conversationData, mode);

            // Cache the result
            this.analysisCache.set(cacheKey, analysis);

            return analysis;
        } catch (error) {
            console.error('Conversation analysis failed:', error);
            throw error;
        }
    }

    /**
     * Perform GPT-4 analysis
     */
    async performGPT4Analysis(conversationData, mode) {
        const systemPrompt = this.getSystemPrompt(mode);
        const userPrompt = this.formatConversationData(conversationData);

        try {
            const response = await fetch(`${CONFIG.APIS.OPENAI.BASE_URL}${CONFIG.APIS.OPENAI.COMPLETIONS_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: CONFIG.APIS.OPENAI.MODEL,
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: userPrompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const analysisText = data.choices[0]?.message?.content;

            if (!analysisText) {
                throw new Error('No analysis received from GPT-4');
            }

            return this.parseAnalysisResponse(analysisText);
        } catch (error) {
            console.error('GPT-4 analysis error:', error);
            throw error;
        }
    }

    /**
     * Get system prompt based on mode
     */
    getSystemPrompt(mode) {
        const basePrompt = `Вы - экспертный аналитик продаж с более чем 10-летним опытом в оценке навыков продаж. Ваша задача - предоставить детальный, конструктивный анализ разговора между продавцом и клиентом.

Пожалуйста, предоставьте анализ в следующем формате JSON:

{
    "overall_score": 85,
    "criteria_scores": {
        "communication_skills": 88,
        "product_knowledge": 82,
        "objection_handling": 85,
        "closing_techniques": 80,
        "relationship_building": 90
    },
    "strengths": [
        "Отличные коммуникативные навыки",
        "Хорошо построены отношения с клиентом"
    ],
    "areas_for_improvement": [
        "Можно улучшить технику закрытия сделки",
        "Больше фокуса на потребностях клиента"
    ],
    "detailed_feedback": "Детальный анализ каждого аспекта разговора...",
    "recommendations": [
        "Рекомендация 1",
        "Рекомендация 2"
    ],
    "key_moments": [
        {
            "timestamp": "01:30",
            "type": "strength",
            "description": "Отличное преодоление возражения"
        }
    ]
}

Важные инструкции:
- Оценивайте по шкале от 0 до 100
- Будьте честны, но конструктивны
- Фокусируйтесь на конкретных примерах из разговора
- Предоставляйте actionable рекомендации
- Используйте только русский язык в ответе`;

        if (mode === 'agent') {
            return basePrompt + '\n\nЭто разговор в режиме агента - живой диалог с AI. Оценивайте естественность общения и способность адаптироваться к ответам клиента.';
        } else {
            return basePrompt + '\n\nЭто структурированный сценарий продаж. Оценивайте соблюдение этапов продаж и технику презентации.';
        }
    }

    /**
     * Format conversation data for analysis
     */
    formatConversationData(conversationData) {
        let formattedData = '';

        if (Array.isArray(conversationData)) {
            // Handle transcript array
            formattedData = 'РАЗГОВОР:\n\n';
            conversationData.forEach((item, index) => {
                const speaker = item.speaker === 'agent' ? 'ПРОДАВЕЦ' : 'КЛИЕНТ';
                formattedData += `${index + 1}. ${speaker}: ${item.text}\n`;
            });
        } else {
            // Handle conversation object
            formattedData = `РЕЖИМ: ${conversationData.mode || 'Неизвестен'}\n`;
            formattedData += `ДЛИТЕЛЬНОСТЬ: ${conversationData.duration || 'Неизвестна'} секунд\n`;
            formattedData += `ДАТА: ${new Date(conversationData.timestamp || Date.now()).toLocaleString('ru-RU')}\n\n`;

            if (conversationData.messages) {
                formattedData += 'РАЗГОВОР:\n\n';
                conversationData.messages.forEach((message, index) => {
                    const speaker = message.role === 'assistant' ? 'ПРОДАВЕЦ' : 'КЛИЕНТ';
                    formattedData += `${index + 1}. ${speaker}: ${message.content}\n`;
                });
            }
        }

        return formattedData;
    }

    /**
     * Parse GPT-4 analysis response
     */
    parseAnalysisResponse(analysisText) {
        try {
            // Extract JSON from response
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in analysis response');
            }

            const analysisData = JSON.parse(jsonMatch[0]);

            // Validate required fields
            if (typeof analysisData.overall_score !== 'number') {
                throw new Error('Invalid overall_score in analysis');
            }

            if (!analysisData.criteria_scores || typeof analysisData.criteria_scores !== 'object') {
                throw new Error('Invalid criteria_scores in analysis');
            }

            // Ensure all criteria have scores
            const requiredCriteria = Object.keys(CONFIG.SCORING_CRITERIA);
            for (const criterion of requiredCriteria) {
                if (typeof analysisData.criteria_scores[criterion] !== 'number') {
                    analysisData.criteria_scores[criterion] = 0;
                }
            }

            // Add metadata
            analysisData.analysis_timestamp = Date.now();
            analysisData.analysis_version = '2.0';

            return analysisData;
        } catch (error) {
            console.error('Failed to parse analysis response:', error);
            // Return fallback analysis
            return this.getFallbackAnalysis();
        }
    }

    /**
     * Get fallback analysis when GPT-4 fails
     */
    getFallbackAnalysis() {
        return {
            overall_score: 50,
            criteria_scores: {
                communication_skills: 50,
                product_knowledge: 50,
                objection_handling: 50,
                closing_techniques: 50,
                relationship_building: 50
            },
            strengths: ['Базовые навыки продаж присутствуют'],
            areas_for_improvement: ['Не удалось выполнить детальный анализ'],
            detailed_feedback: 'Произошла ошибка при анализе разговора. Пожалуйста, попробуйте еще раз.',
            recommendations: ['Проверьте подключение к OpenAI API', 'Убедитесь, что API ключ действителен'],
            key_moments: [],
            analysis_timestamp: Date.now(),
            analysis_version: '2.0',
            fallback: true
        };
    }

    /**
     * Create cache key for analysis
     */
    createCacheKey(conversationData, mode) {
        const conversationString = JSON.stringify(conversationData);
        const hash = this.simpleHash(conversationString + mode);
        return `${mode}_${hash}`;
    }

    /**
     * Simple hash function for cache keys
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    /**
     * Get analysis statistics
     */
    getAnalysisStats() {
        return {
            totalAnalyses: this.analysisCache.size,
            cacheHitRate: 0, // Would need to track hits vs misses
            lastAnalysis: null // Would need to track timestamps
        };
    }

    /**
     * Clear analysis cache
     */
    clearCache() {
        this.analysisCache.clear();
        console.log('Analysis cache cleared');
    }

    /**
     * Export analysis data
     */
    exportAnalysis(analysisData, format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(analysisData, null, 2);

            case 'csv':
                return this.convertToCSV(analysisData);

            case 'text':
                return this.convertToText(analysisData);

            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Convert analysis to CSV
     */
    convertToCSV(analysisData) {
        const csvRows = [
            ['Metric', 'Value'],
            ['Overall Score', analysisData.overall_score],
            ...Object.entries(analysisData.criteria_scores).map(([key, value]) => [
                key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value
            ]),
            ['Analysis Date', new Date(analysisData.analysis_timestamp).toLocaleString('ru-RU')]
        ];

        return csvRows.map(row => row.join(',')).join('\n');
    }

    /**
     * Convert analysis to text
     */
    convertToText(analysisData) {
        let text = `АНАЛИЗ РАЗГОВОРА ПРОДАЖ
Дата анализа: ${new Date(analysisData.analysis_timestamp).toLocaleString('ru-RU')}

ОБЩИЙ РЕЗУЛЬТАТ: ${analysisData.overall_score}/100

ДЕТАЛЬНЫЕ ОЦЕНКИ:
`;

        Object.entries(analysisData.criteria_scores).forEach(([criterion, score]) => {
            const criterionName = CONFIG.SCORING_CRITERIA[criterion]?.name || criterion;
            text += `- ${criterionName}: ${score}/100\n`;
        });

        text += '\nСИЛЬНЫЕ СТОРОНЫ:\n';
        analysisData.strengths.forEach(strength => {
            text += `- ${strength}\n`;
        });

        text += '\nОБЛАСТИ ДЛЯ УЛУЧШЕНИЯ:\n';
        analysisData.areas_for_improvement.forEach(area => {
            text += `- ${area}\n`;
        });

        text += '\nРЕКОМЕНДАЦИИ:\n';
        analysisData.recommendations.forEach(rec => {
            text += `- ${rec}\n`;
        });

        return text;
    }

    /**
     * Test OpenAI API connection
     */
    async testConnection() {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }

        try {
            const response = await fetch(`${CONFIG.APIS.OPENAI.BASE_URL}/v1/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.ok;
        } catch (error) {
            console.error('OpenAI connection test failed:', error);
            return false;
        }
    }
}

// Create global instance
const conversationAnalyzer = new ConversationAnalyzer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConversationAnalyzer;
} else {
    window.ConversationAnalyzer = ConversationAnalyzer;
    window.conversationAnalyzer = conversationAnalyzer;
}