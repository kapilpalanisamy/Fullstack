import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Brain, 
  TrendingUp, 
  Users, 
  MapPin, 
  DollarSign,
  Clock,
  Award,
  Zap
} from "lucide-react";

// AI Job Matching Algorithm
const calculateJobMatch = (job, userProfile) => {
  if (!job || !userProfile) return 0;

  let score = 0;
  let maxScore = 0;

  // Skills matching (40% weight)
  const jobSkills = job.requirements?.toLowerCase().split(/[,\s]+/) || [];
  const userSkills = userProfile.skills?.map(s => s.toLowerCase()) || [];
  
  let skillMatches = 0;
  jobSkills.forEach(jobSkill => {
    if (userSkills.some(userSkill => 
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    )) {
      skillMatches++;
    }
  });
  
  const skillScore = jobSkills.length > 0 ? (skillMatches / jobSkills.length) * 40 : 0;
  score += skillScore;
  maxScore += 40;

  // Experience level matching (25% weight)
  const experienceScore = 25; // Simplified - would be more complex in real implementation
  score += experienceScore;
  maxScore += 25;

  // Location matching (15% weight)
  const locationScore = (job.location && userProfile.location && 
    job.location.toLowerCase().includes(userProfile.location.toLowerCase())) ? 15 : 5;
  score += locationScore;
  maxScore += 15;

  // Salary matching (20% weight)
  const salaryScore = 20; // Would check salary expectations vs job salary
  score += salaryScore;
  maxScore += 20;

  return Math.round((score / maxScore) * 100);
};

// Mock AI recommendations engine
const generateSmartRecommendations = (userProfile) => {
  const recommendations = [
    {
      type: "skill",
      icon: Brain,
      title: "Trending Skills",
      description: "Based on your profile, consider learning:",
      items: ["TypeScript", "Docker", "AWS", "GraphQL"]
    },
    {
      type: "career",
      icon: TrendingUp,
      title: "Career Growth",
      description: "Recommended next steps:",
      items: ["Senior Developer roles", "Tech Lead positions", "Full-stack opportunities"]
    },
    {
      type: "network",
      icon: Users,
      title: "Networking",
      description: "Connect with professionals in:",
      items: ["React developers", "Startup founders", "Remote work advocates"]
    }
  ];

  return recommendations;
};

const JobMatchingComponent = ({ jobs = [], userProfile = {} }) => {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateMatches = async () => {
      setIsLoading(true);
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate match scores for all jobs
      const jobsWithScores = jobs.map(job => ({
        ...job,
        matchScore: calculateJobMatch(job, userProfile),
        matchReasons: generateMatchReasons(job, userProfile)
      }));

      // Sort by match score and take top matches
      const sortedJobs = jobsWithScores
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      setMatchedJobs(sortedJobs);
      setRecommendations(generateSmartRecommendations(userProfile));
      setIsLoading(false);
    };

    if (jobs.length > 0) {
      calculateMatches();
    }
  }, [jobs, userProfile]);

  const generateMatchReasons = (job, userProfile) => {
    const reasons = [];
    
    if (job.location && userProfile.location && 
        job.location.toLowerCase().includes(userProfile.location.toLowerCase())) {
      reasons.push("Location match");
    }
    
    if (userProfile.skills && userProfile.skills.length > 0) {
      reasons.push("Skills alignment");
    }
    
    reasons.push("Experience level");
    reasons.push("Salary range");
    
    return reasons.slice(0, 3);
  };

  const getMatchColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-blue-600 bg-blue-100";
    if (score >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const getMatchLabel = (score) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain size={20} />
              AI Job Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Job Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            AI-Powered Job Matches
          </CardTitle>
          <p className="text-sm text-gray-600">
            Jobs ranked by compatibility with your profile
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matchedJobs.length > 0 ? (
              matchedJobs.map((job, index) => (
                <div key={job.id || index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-gray-600">{job.company?.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {job.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(job.matchScore)}`}>
                        {job.matchScore}% Match
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {getMatchLabel(job.matchScore)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={job.matchScore} className="h-2" />
                    
                    <div className="flex flex-wrap gap-2">
                      {job.matchReasons?.map((reason, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex items-center gap-1">
                      <Star size={14} />
                      Apply Now
                    </Button>
                    <Button size="sm" variant="outline">
                      Save Job
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Brain size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Complete your profile to get AI-powered job matches
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={20} />
            Smart Career Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <rec.icon size={20} className="text-blue-600" />
                  <h4 className="font-medium">{rec.title}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                <div className="space-y-1">
                  {rec.items.map((item, i) => (
                    <Badge key={i} variant="outline" className="text-xs mr-1 mb-1">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Match Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award size={20} />
            Your Match Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {matchedJobs.length}
              </div>
              <p className="text-sm text-gray-600">Total Matches</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {matchedJobs.filter(job => job.matchScore >= 80).length}
              </div>
              <p className="text-sm text-gray-600">Excellent Matches</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(matchedJobs.reduce((acc, job) => acc + job.matchScore, 0) / matchedJobs.length) || 0}%
              </div>
              <p className="text-sm text-gray-600">Avg Match Score</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {userProfile.skills?.length || 0}
              </div>
              <p className="text-sm text-gray-600">Skills Listed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobMatchingComponent;
