import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import JobCard from '@/components/job-card';
import { Brain, Target, TrendingUp, Zap, User, MapPin, Clock } from 'lucide-react';

const JobMatching = () => {
  const [user, setUser] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingCriteria, setMatchingCriteria] = useState({
    skills: [],
    location: '',
    experience: ''
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    setUser(currentUser);
    if (currentUser) {
      fetchUserProfile(currentUser.id);
      fetchAIMatchedJobs(currentUser.id);
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (result.success) {
        const profile = result.data;
        setMatchingCriteria({
          skills: profile.skills ? (typeof profile.skills === 'string' ? profile.skills.split(',').map(s => s.trim()) : profile.skills) : [],
          location: profile.location || '',
          experience: profile.experience_years || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAIMatchedJobs = async (userId) => {
    try {
      setLoading(true);
      console.log('Fetching AI jobs for job matching:', userId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-jobs/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      console.log('Job matching API response:', result);
      
      if (result.success) {
        // Ensure each job has safe string values
        const safeJobs = (result.data || []).map(job => ({
          ...job,
          title: job.title ? String(job.title) : 'Untitled Job',
          description: job.description ? String(job.description) : 'No description available',
          location: job.location ? String(job.location) : 'Location not specified',
          company_name: job.company_name ? String(job.company_name) : 'Unknown Company',
          matchScore: job.matchScore || 0,
          relevancePercentage: job.relevancePercentage || 0,
          matchingSkills: Array.isArray(job.matchingSkills) ? job.matchingSkills : []
        }));
        
        setMatchedJobs(safeJobs);
      } else {
        console.error('Failed to fetch AI matched jobs:', result.error);
        setMatchedJobs([]);
      }
    } catch (error) {
      console.error('Error fetching AI matched jobs:', error);
      setMatchedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your profile for perfect matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Job Matching</h1>
            <p className="text-gray-600">Advanced matching algorithm based on your profile</p>
          </div>
        </div>
      </div>

      {/* Matching Criteria Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-purple-600" />
              Skills Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {matchingCriteria.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {matchingCriteria.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{matchingCriteria.skills.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-blue-600" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {matchingCriteria.location || 'Any location'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-green-600" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {matchingCriteria.experience ? `${matchingCriteria.experience} years` : 'Any level'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job Matches */}
      {matchedJobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">
              Update your profile to get better AI-powered job recommendations
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = '/skill-analysis'}>
                Update Profile
              </Button>
              <Button variant="outline" onClick={() => fetchAIMatchedJobs(user?.id)}>
                Refresh Matches
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              {matchedJobs.length} AI-Matched Jobs
            </h2>
            <Button onClick={() => fetchAIMatchedJobs(user?.id)} disabled={loading}>
              <Zap className="h-4 w-4 mr-2" />
              Refresh Matches
            </Button>
          </div>
          
          <div className="grid gap-6">
            {matchedJobs.map((job, index) => (
              <div key={job.id} className="relative">
                <div className="absolute -left-4 top-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                  {job.relevancePercentage || 0}% Match
                </div>
                <JobCard 
                  job={job} 
                  savedJobs={[]} 
                  onJobSaved={() => {}}
                  showMatchScore={true}
                />
                {job.matchingSkills && job.matchingSkills.length > 0 && (
                  <div className="mt-2 px-4">
                    <p className="text-sm text-gray-600 mb-2">Matching skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.matchingSkills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs bg-purple-50 border-purple-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatching;