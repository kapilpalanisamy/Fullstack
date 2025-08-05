import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import JobCard from '@/components/job-card';
import { Briefcase, Target, Zap } from 'lucide-react';

const AIJobs = () => {
  const [user, setUser] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    setUser(currentUser);
    if (currentUser) {
      fetchAIMatchedJobs(currentUser.id);
    }
  }, []);

  const fetchAIMatchedJobs = async (userId) => {
    try {
      setLoading(true);
      console.log('Fetching AI jobs for user:', userId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-jobs/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      console.log('AI jobs API response:', result);
      
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your perfect job matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Job Matches</h1>
            <p className="text-gray-600">Personalized job recommendations powered by AI</p>
          </div>
        </div>
        
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Matching Algorithm</h3>
                  <p className="text-sm text-gray-600">Based on your skills, experience, and preferences</p>
                </div>
              </div>
              <Button onClick={() => fetchAIMatchedJobs(user?.id)} disabled={loading}>
                Refresh Matches
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Matches */}
      {matchedJobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No AI matches found yet</h3>
            <p className="text-gray-600 mb-6">
              Update your profile and skills to get better job recommendations
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = '/skill-analysis'}>
                Update Skills
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/job-listing'}>
                Browse All Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {matchedJobs.length} AI-Recommended Jobs
            </h2>
            <div className="text-sm text-gray-600">
              Sorted by relevance score
            </div>
          </div>
          
          <div className="grid gap-6">
            {matchedJobs.map((job, index) => (
              <div key={job.id} className="relative">
                <div className="absolute -left-4 top-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  #{index + 1} Match
                </div>
                <JobCard 
                  job={job} 
                  savedJobs={[]} 
                  onJobSaved={() => {}}
                  showMatchScore={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIJobs;
