// AI Service for Job Portal
// Handles job matching, skill extraction, and smart suggestions

class AIService {
  constructor() {
    this.apiBase = `${import.meta.env.VITE_API_URL}/api`;
  }

  // Extract skills from text using NLP
  async extractSkills(text) {
    try {
      const response = await fetch(`${this.apiBase}/ai/extract-skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract skills');
      }

      const data = await response.json();
      return data.skills || [];
    } catch (error) {
      console.error('Error extracting skills:', error);
      // Fallback: simple keyword extraction
      return this.fallbackSkillExtraction(text);
    }
  }

  // Fallback skill extraction using keywords
  fallbackSkillExtraction(text) {
    const skillKeywords = [
      'javascript', 'react', 'node.js', 'python', 'java', 'c++', 'c#', 'php',
      'html', 'css', 'typescript', 'angular', 'vue', 'django', 'flask',
      'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'docker',
      'kubernetes', 'git', 'agile', 'scrum', 'leadership', 'management',
      'ui/ux', 'design', 'testing', 'devops', 'machine learning', 'ai',
      'data science', 'analytics', 'blockchain', 'web3', 'solidity'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const foundSkills = [];

    skillKeywords.forEach(skill => {
      if (words.some(word => word.includes(skill) || skill.includes(word))) {
        foundSkills.push(skill);
      }
    });

    return foundSkills.slice(0, 5); // Return top 5 skills
  }

  // Calculate job-applicant match score
  async calculateMatchScore(jobDescription, userProfile) {
    try {
      const response = await fetch(`${this.apiBase}/ai/match-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          userSkills: userProfile.skills || [],
          userExperience: userProfile.experience || '',
          userBio: userProfile.bio || ''
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate match score');
      }

      const data = await response.json();
      return data.score || 0;
    } catch (error) {
      console.error('Error calculating match score:', error);
      // Fallback: simple keyword matching
      return this.fallbackMatchScore(jobDescription, userProfile);
    }
  }

  // Fallback match score calculation
  fallbackMatchScore(jobDescription, userProfile) {
    const jobWords = jobDescription.toLowerCase().split(/\s+/);
    const userSkills = (userProfile.skills || []).map(skill => skill.toLowerCase());
    const userBio = (userProfile.bio || '').toLowerCase().split(/\s+/);

    let matchCount = 0;
    const totalSkills = userSkills.length;

    userSkills.forEach(skill => {
      if (jobWords.some(word => word.includes(skill) || skill.includes(word))) {
        matchCount++;
      }
    });

    // Also check bio keywords
    const bioMatches = userBio.filter(word => 
      jobWords.some(jobWord => jobWord.includes(word) || word.includes(jobWord))
    ).length;

    const skillScore = totalSkills > 0 ? (matchCount / totalSkills) * 70 : 0;
    const bioScore = Math.min(bioMatches * 5, 30); // Max 30 points for bio matches

    return Math.round(skillScore + bioScore);
  }

  // Get smart job suggestions based on user profile
  async getJobSuggestions(userProfile, jobs) {
    try {
      const response = await fetch(`${this.apiBase}/ai/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userSkills: userProfile.skills || [],
          userExperience: userProfile.experience || '',
          userBio: userProfile.bio || '',
          availableJobs: jobs
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get job suggestions');
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Error getting job suggestions:', error);
      // Fallback: simple filtering and sorting
      return this.fallbackJobSuggestions(userProfile, jobs);
    }
  }

  // Fallback job suggestions
  fallbackJobSuggestions(userProfile, jobs) {
    const userSkills = (userProfile.skills || []).map(skill => skill.toLowerCase());
    
    return jobs
      .map(job => {
        const jobWords = (job.description + ' ' + (job.required_skills || []).join(' ')).toLowerCase().split(/\s+/);
        let matchCount = 0;
        
        userSkills.forEach(skill => {
          if (jobWords.some(word => word.includes(skill) || skill.includes(word))) {
            matchCount++;
          }
        });

        const matchScore = userSkills.length > 0 ? (matchCount / userSkills.length) * 100 : 0;
        
        return {
          ...job,
          matchScore: Math.round(matchScore)
        };
      })
      .filter(job => job.matchScore > 20) // Only show jobs with >20% match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Return top 10 suggestions
  }

  // Analyze resume and extract structured data
  async analyzeResume(resumeText) {
    try {
      const response = await fetch(`${this.apiBase}/ai/analyze-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing resume:', error);
      // Fallback: basic text analysis
      return this.fallbackResumeAnalysis(resumeText);
    }
  }

  // Fallback resume analysis
  fallbackResumeAnalysis(resumeText) {
    const skills = this.fallbackSkillExtraction(resumeText);
    
    // Simple experience extraction
    const experienceMatch = resumeText.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i);
    const experience = experienceMatch ? parseInt(experienceMatch[1]) : 0;

    // Simple education extraction
    const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college'];
    const hasEducation = educationKeywords.some(keyword => 
      resumeText.toLowerCase().includes(keyword)
    );

    return {
      skills,
      experience,
      education: hasEducation,
      confidence: 0.7
    };
  }
}

export default new AIService(); 