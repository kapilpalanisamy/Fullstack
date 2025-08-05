/**
 * AI Service
 * OpenAI integration for skill extraction and job matching
 */

const OpenAI = require('openai');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config/config');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai?.apiKey || process.env.OPENAI_API_KEY
    });
    
    // Fallback skills database for when OpenAI is not available
    this.skillsDatabase = [
      // Programming Languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
      'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS', 'Dart',
      
      // Frameworks & Libraries
      'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
      'Laravel', 'Rails', 'Next.js', 'Nuxt.js', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS',
      
      // Databases
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite', 'Oracle', 'DynamoDB',
      'Cassandra', 'Neo4j', 'InfluxDB',
      
      // Cloud & DevOps
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
      'Terraform', 'Ansible', 'Chef', 'Puppet', 'Nagios', 'Prometheus', 'Grafana',
      
      // Tools & Technologies
      'Git', 'Linux', 'Bash', 'PowerShell', 'Nginx', 'Apache', 'REST API', 'GraphQL', 'gRPC',
      'Microservices', 'Serverless', 'Machine Learning', 'Data Science', 'Big Data', 'Blockchain',
      
      // Design & UI/UX
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'UI Design', 'UX Design',
      'Wireframing', 'Prototyping', 'User Research',
      
      // Project Management
      'Agile', 'Scrum', 'Kanban', 'Jira', 'Trello', 'Asana', 'Slack', 'Teams', 'Confluence'
    ];
  }

  /**
   * Extract skills from job description using OpenAI
   */
  async extractSkillsFromJobDescription(jobDescription, jobTitle = '') {
    try {
      if (!this.openai || !config.openai?.apiKey) {
        logger.warn('OpenAI not configured, using fallback skill extraction');
        return this.fallbackSkillExtraction(jobDescription, jobTitle);
      }

      const prompt = `
        Analyze this job description and extract the technical skills, tools, and technologies required.
        Return only a JSON array of skills (no explanation).
        
        Job Title: ${jobTitle}
        Job Description: ${jobDescription}
        
        Focus on:
        - Programming languages
        - Frameworks and libraries
        - Databases
        - Cloud platforms
        - Tools and software
        - Technical concepts
        
        Example format: ["JavaScript", "React", "Node.js", "PostgreSQL", "AWS"]
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a technical recruiter expert at identifying skills from job descriptions. Return only valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const skillsText = response.choices[0]?.message?.content?.trim();
      let extractedSkills = [];

      try {
        extractedSkills = JSON.parse(skillsText);
        if (!Array.isArray(extractedSkills)) {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        logger.warn('Failed to parse OpenAI response, using fallback', { parseError: parseError.message });
        return this.fallbackSkillExtraction(jobDescription, jobTitle);
      }

      // Clean and validate skills
      const cleanedSkills = extractedSkills
        .filter(skill => typeof skill === 'string' && skill.length > 1)
        .map(skill => skill.trim())
        .slice(0, 20); // Limit to 20 skills

      logger.info('Skills extracted using OpenAI', { 
        skillsCount: cleanedSkills.length,
        skills: cleanedSkills 
      });

      return cleanedSkills;

    } catch (error) {
      logger.error('OpenAI skill extraction failed', { error: error.message });
      return this.fallbackSkillExtraction(jobDescription, jobTitle);
    }
  }

  /**
   * Fallback skill extraction using keyword matching
   */
  fallbackSkillExtraction(text, jobTitle = '') {
    const combinedText = `${jobTitle} ${text}`.toLowerCase();
    const foundSkills = [];

    for (const skill of this.skillsDatabase) {
      const skillLower = skill.toLowerCase();
      
      // Escape special characters for regex
      const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Check for exact matches or common variations
      const patterns = [
        new RegExp(`\\b${escapedSkill}\\b`, 'i'),
        new RegExp(`\\b${escapedSkill}\\.js\\b`, 'i'), // For .js frameworks
        new RegExp(`\\b${escapedSkill} js\\b`, 'i'),   // For "react js"
      ];

      if (patterns.some(pattern => pattern.test(combinedText))) {
        foundSkills.push(skill);
      }
    }

    logger.info('Skills extracted using fallback method', { 
      skillsCount: foundSkills.length,
      skills: foundSkills 
    });

    return foundSkills.slice(0, 15); // Limit to 15 skills for fallback
  }

  /**
   * Calculate job match score between user skills and job requirements
   */
  calculateJobMatchScore(userSkills = [], jobSkills = []) {
    if (!userSkills.length || !jobSkills.length) {
      return 0;
    }

    const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
    const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
    
    let matchedSkills = 0;
    let totalWeight = 0;

    for (const jobSkill of jobSkillsLower) {
      let skillWeight = 1;
      
      // Assign higher weights to important skills
      if (this.isHighPrioritySkill(jobSkill)) {
        skillWeight = 2;
      }
      
      totalWeight += skillWeight;
      
      if (userSkillsLower.includes(jobSkill)) {
        matchedSkills += skillWeight;
      }
    }

    const matchScore = totalWeight > 0 ? Math.round((matchedSkills / totalWeight) * 100) : 0;
    
    logger.debug('Job match score calculated', {
      userSkillsCount: userSkills.length,
      jobSkillsCount: jobSkills.length,
      matchedSkills,
      totalWeight,
      matchScore
    });

    return matchScore;
  }

  /**
   * Check if a skill is high priority (frameworks, languages, etc.)
   */
  isHighPrioritySkill(skill) {
    const highPrioritySkills = [
      'javascript', 'typescript', 'python', 'java', 'react', 'vue', 'angular',
      'node.js', 'express', 'django', 'spring', 'aws', 'azure', 'docker', 'kubernetes'
    ];
    
    return highPrioritySkills.includes(skill.toLowerCase());
  }

  /**
   * Generate personalized job recommendations
   */
  async generateJobRecommendations(userProfile, availableJobs = []) {
    try {
      if (!userProfile.skills || !availableJobs.length) {
        return [];
      }

      const recommendations = availableJobs.map(job => {
        const matchScore = this.calculateJobMatchScore(
          userProfile.skills,
          job.skills_required || []
        );

        return {
          ...job,
          matchScore,
          matchedSkills: this.getMatchedSkills(userProfile.skills, job.skills_required || []),
          missingSkills: this.getMissingSkills(userProfile.skills, job.skills_required || [])
        };
      });

      // Sort by match score and filter out very low matches
      const sortedRecommendations = recommendations
        .filter(job => job.matchScore >= 20) // At least 20% match
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Top 10 recommendations

      logger.info('Job recommendations generated', {
        userId: userProfile.id,
        totalJobs: availableJobs.length,
        recommendationsCount: sortedRecommendations.length
      });

      return sortedRecommendations;

    } catch (error) {
      logger.error('Failed to generate job recommendations', { error: error.message });
      throw new AppError('Failed to generate recommendations', 500);
    }
  }

  /**
   * Get skills that match between user and job
   */
  getMatchedSkills(userSkills = [], jobSkills = []) {
    const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
    const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
    
    return jobSkills.filter(jobSkill => 
      userSkillsLower.includes(jobSkill.toLowerCase())
    );
  }

  /**
   * Get skills that user is missing for the job
   */
  getMissingSkills(userSkills = [], jobSkills = []) {
    const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
    
    return jobSkills.filter(jobSkill => 
      !userSkillsLower.includes(jobSkill.toLowerCase())
    );
  }

  /**
   * Enhance job description with AI-generated improvements
   */
  async enhanceJobDescription(originalDescription, jobTitle, companyName) {
    try {
      if (!this.openai || !config.openai?.apiKey) {
        logger.warn('OpenAI not configured, returning original description');
        return originalDescription;
      }

      const prompt = `
        Improve this job description to be more attractive and comprehensive while keeping the original requirements.
        Make it more engaging and professional.
        
        Job Title: ${jobTitle}
        Company: ${companyName}
        Original Description: ${originalDescription}
        
        Improve:
        - Clarity and structure
        - Benefits and opportunities
        - Company culture hints
        - Growth potential
        
        Keep the same technical requirements and qualifications.
        Return only the improved description (no explanations).
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional job description writer who creates engaging and comprehensive job postings.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      const enhancedDescription = response.choices[0]?.message?.content?.trim();
      
      if (enhancedDescription && enhancedDescription.length > 100) {
        logger.info('Job description enhanced using OpenAI');
        return enhancedDescription;
      } else {
        logger.warn('OpenAI enhancement failed, returning original');
        return originalDescription;
      }

    } catch (error) {
      logger.error('Failed to enhance job description', { error: error.message });
      return originalDescription;
    }
  }

  /**
   * Get skill suggestions for user profile
   */
  getSkillSuggestions(currentSkills = [], jobTitle = '', experienceLevel = 'MID') {
    const currentSkillsLower = currentSkills.map(skill => skill.toLowerCase());
    
    // Skill recommendations based on job title and experience
    const skillRecommendations = {
      'frontend': ['React', 'Vue.js', 'Angular', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      'backend': ['Node.js', 'Express.js', 'Django', 'PostgreSQL', 'MongoDB', 'Redis'],
      'fullstack': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
      'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
      'devops': ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Prometheus'],
      'data': ['Python', 'Pandas', 'NumPy', 'SQL', 'Tableau', 'Machine Learning']
    };

    const jobTitleLower = jobTitle.toLowerCase();
    let suggestions = [];

    // Find relevant skill category
    for (const [category, skills] of Object.entries(skillRecommendations)) {
      if (jobTitleLower.includes(category)) {
        suggestions = skills.filter(skill => 
          !currentSkillsLower.includes(skill.toLowerCase())
        );
        break;
      }
    }

    // If no specific category found, suggest popular skills
    if (!suggestions.length) {
      const popularSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'];
      suggestions = popularSkills.filter(skill => 
        !currentSkillsLower.includes(skill.toLowerCase())
      );
    }

    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }
}

module.exports = new AIService();
