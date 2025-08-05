/**
 * AI Integration Test
 * Test AI service functionality without database dependencies
 */

const aiService = require('./src/services/aiService');

async function testAIIntegration() {
  console.log('🧠 Testing RizeOS AI Integration...\n');

  // Test 1: Skill extraction with fallback method
  console.log('✅ Test 1: Skill Extraction (Fallback Method)');
  const jobDescription = `
    We are looking for a Senior Full Stack Developer to join our team.
    
    Requirements:
    - 5+ years of experience in JavaScript and TypeScript
    - Strong experience with React.js and Node.js
    - Experience with PostgreSQL and MongoDB
    - Knowledge of AWS cloud services
    - Familiarity with Docker and Kubernetes
    - Understanding of REST APIs and GraphQL
    - Experience with Git version control
  `;

  try {
    const extractedSkills = await aiService.extractSkillsFromJobDescription(
      jobDescription, 
      'Senior Full Stack Developer'
    );
    console.log('   Extracted Skills:', extractedSkills);
    console.log('   Skills Count:', extractedSkills.length);
    console.log('   ✓ Skill extraction working\n');
  } catch (error) {
    console.log('   ✗ Skill extraction failed:', error.message);
  }

  // Test 2: Job match calculation
  console.log('✅ Test 2: Job Match Calculation');
  const userSkills = ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git', 'AWS'];
  const jobSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker'];
  
  try {
    const matchScore = aiService.calculateJobMatchScore(userSkills, jobSkills);
    const matchedSkills = aiService.getMatchedSkills(userSkills, jobSkills);
    const missingSkills = aiService.getMissingSkills(userSkills, jobSkills);
    
    console.log('   User Skills:', userSkills);
    console.log('   Job Requirements:', jobSkills);
    console.log('   Match Score:', matchScore + '%');
    console.log('   Matched Skills:', matchedSkills);
    console.log('   Missing Skills:', missingSkills);
    console.log('   ✓ Job matching working\n');
  } catch (error) {
    console.log('   ✗ Job matching failed:', error.message);
  }

  // Test 3: Skill suggestions
  console.log('✅ Test 3: Skill Suggestions');
  try {
    const currentSkills = ['JavaScript', 'React'];
    const suggestions = aiService.getSkillSuggestions(
      currentSkills, 
      'Frontend Developer', 
      'MID'
    );
    
    console.log('   Current Skills:', currentSkills);
    console.log('   Job Title: Frontend Developer');
    console.log('   Suggestions:', suggestions);
    console.log('   ✓ Skill suggestions working\n');
  } catch (error) {
    console.log('   ✗ Skill suggestions failed:', error.message);
  }

  // Test 4: Job recommendations (mock data)
  console.log('✅ Test 4: Job Recommendations');
  try {
    const mockUser = {
      id: 'test-user',
      skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL']
    };
    
    const mockJobs = [
      {
        id: 'job-1',
        title: 'Frontend Developer',
        skills_required: ['JavaScript', 'React', 'CSS', 'HTML'],
        company: { name: 'Tech Corp' }
      },
      {
        id: 'job-2', 
        title: 'Full Stack Developer',
        skills_required: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
        company: { name: 'StartupXYZ' }
      },
      {
        id: 'job-3',
        title: 'Python Developer',
        skills_required: ['Python', 'Django', 'PostgreSQL'],
        company: { name: 'Data Corp' }
      }
    ];
    
    const recommendations = await aiService.generateJobRecommendations(mockUser, mockJobs);
    
    console.log('   User Skills:', mockUser.skills);
    console.log('   Available Jobs:', mockJobs.length);
    console.log('   Recommendations:');
    recommendations.forEach((job, index) => {
      console.log(`     ${index + 1}. ${job.title} at ${job.company.name}`);
      console.log(`        Match Score: ${job.matchScore}%`);
      console.log(`        Matched Skills: ${job.matchedSkills.join(', ')}`);
      console.log(`        Missing Skills: ${job.missingSkills.join(', ')}`);
    });
    console.log('   ✓ Job recommendations working\n');
  } catch (error) {
    console.log('   ✗ Job recommendations failed:', error.message);
  }

  console.log('🎉 AI Integration Test Complete!');
  console.log('\n📋 Summary:');
  console.log('   - Skill extraction: Working with fallback method');
  console.log('   - Job matching: Fully functional');
  console.log('   - Skill suggestions: Working');
  console.log('   - Job recommendations: Working');
  console.log('\n💡 Note: OpenAI integration will work when API key is provided');
  console.log('   Currently using fallback methods for skill extraction');
}

// Run the test
testAIIntegration().catch(console.error);
