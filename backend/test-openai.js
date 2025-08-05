const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = require('./src/config/config');
const aiService = require('./src/services/aiService');

async function testOpenAI() {
  console.log('🤖 Testing OpenAI Integration...\n');
  
  console.log('🔍 Configuration Check:');
  console.log('OpenAI API Key:', config.openai?.apiKey ? '✅ Set' : '❌ Missing');
  console.log('OpenAI Model:', config.openai?.model || 'gpt-3.5-turbo');
  
  try {
    // Test 1: Skill Extraction
    console.log('\n🎯 Test 1: Skill Extraction from Job Description');
    const jobDescription = `
      We are looking for a Full Stack Developer to join our team.
      
      Requirements:
      - 3+ years experience with React and Node.js
      - Strong knowledge of PostgreSQL and MongoDB
      - Experience with AWS cloud services
      - Familiarity with Docker and Kubernetes
      - Knowledge of TypeScript and GraphQL
      - Experience with agile development methodologies
    `;
    
    console.log('⏳ Extracting skills...');
    const extractedSkills = await aiService.extractSkillsFromJobDescription(
      jobDescription, 
      'Full Stack Developer'
    );
    
    console.log('✅ Skills extracted successfully:');
    console.log('📋 Skills:', extractedSkills.skills);
    console.log('⭐ Primary Skills:', extractedSkills.primarySkills);
    console.log('📊 Confidence Score:', extractedSkills.confidence);
    
    // Test 2: Job Description Enhancement
    console.log('\n🎨 Test 2: Job Description Enhancement');
    const basicDescription = 'Looking for a software developer with JavaScript experience.';
    
    console.log('⏳ Enhancing job description...');
    const enhancedDescription = await aiService.enhanceJobDescription(
      basicDescription,
      'Software Developer',
      'TechCorp Inc.'
    );
    
    console.log('✅ Job description enhanced successfully:');
    console.log('📝 Enhanced Description:');
    console.log(enhancedDescription.slice(0, 200) + '...\n');
    
    console.log('🎉 OpenAI integration is working perfectly!');
    console.log('\n📊 AI Features Available:');
    console.log('✅ Skill extraction from job descriptions');
    console.log('✅ Job recommendation matching');
    console.log('✅ Job description enhancement');
    console.log('✅ Fallback to local skills database when needed');
    
  } catch (error) {
    console.log('❌ OpenAI test failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n🔧 API Key Issue:');
      console.log('- Make sure your OpenAI API key is valid');
      console.log('- Check if you have sufficient credits');
      console.log('- Verify the key format starts with "sk-"');
    } else if (error.message.includes('quota')) {
      console.log('\n💳 Quota Issue:');
      console.log('- You may have exceeded your API usage limit');
      console.log('- Check your OpenAI billing dashboard');
      console.log('- The system will use fallback methods');
    } else {
      console.log('\n🔧 Other Issue:');
      console.log('- Check your internet connection');
      console.log('- Verify OpenAI service status');
      console.log('- The system will gracefully fallback to local processing');
    }
  }
}

testOpenAI();
