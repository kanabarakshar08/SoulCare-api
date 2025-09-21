// Test script for OpenAI integration
// Run with: node App/Services/AI/test-openai.js

import 'dotenv/config';
import ChatBotService from './ChatBotService.js';

async function testOpenAIIntegration() {
    console.log('🧪 Testing OpenAI Integration for SoulCare ChatBot...\n');

    try {
        // Test 1: Basic message processing
        console.log('Test 1: Basic Message Processing');
        console.log('================================');
        
        const testMessage = "I've been feeling really anxious lately about work and relationships.";
        console.log(`User Message: "${testMessage}"`);
        
        const result = await ChatBotService.processMessage('test_user_id', testMessage);
        
        console.log('✅ Response Generated:');
        console.log(`AI Response: "${result.response}"`);
        console.log(`Concerns Detected: ${result.concerns.length}`);
        console.log(`Recommendations: ${result.recommendations.length}`);
        console.log(`Should Escalate: ${result.should_escalate}`);
        console.log('');

        // Test 2: Crisis detection
        console.log('Test 2: Crisis Detection');
        console.log('========================');
        
        const crisisMessage = "I don't see any point in living anymore. I want to hurt myself.";
        console.log(`User Message: "${crisisMessage}"`);
        
        const crisisResult = await ChatBotService.processMessage('test_user_id', crisisMessage);
        
        console.log('✅ Crisis Response Generated:');
        console.log(`AI Response: "${crisisResult.response}"`);
        console.log(`Risk Level: ${JSON.stringify(crisisResult.risk_level, null, 2)}`);
        console.log(`Should Escalate: ${crisisResult.should_escalate}`);
        console.log('');

        // Test 3: Conversation history
        console.log('Test 3: Conversation History');
        console.log('============================');
        
        const sessionId = result.session_id;
        const history = await ChatBotService.getConversationHistory('test_user_id', sessionId);
        
        console.log('✅ Conversation History Retrieved:');
        console.log(`Session ID: ${history.session_id}`);
        console.log(`Message Count: ${history.messages.length}`);
        console.log(`Concerns: ${history.mental_health_concerns.length}`);
        console.log('');

        // Test 4: User sessions
        console.log('Test 4: User Sessions');
        console.log('=====================');
        
        const sessions = await ChatBotService.getUserSessions('test_user_id', 1, 5);
        
        console.log('✅ User Sessions Retrieved:');
        console.log(`Total Sessions: ${sessions.pagination.total_sessions}`);
        console.log(`Current Page: ${sessions.pagination.current_page}`);
        console.log(`Sessions: ${sessions.sessions.length}`);
        console.log('');

        console.log('🎉 All tests completed successfully!');
        console.log('OpenAI integration is working properly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
        
        if (error.message.includes('API key')) {
            console.log('\n💡 Make sure to set your OPENAI_API_KEY in the .env file');
        }
        
        process.exit(1);
    }
}

// Run the test
testOpenAIIntegration();
