import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building, 
  Clock, 
  DollarSign, 
  ExternalLink,
  Trash2,
  Calendar,
  Bookmark
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const SavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedJobs();
      fetchCompanies();
    }
  }, [user]);

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/saved-jobs/${user.id}`);
      const result = await response.json();
      
      if (response.ok) {
        // Handle both direct array and {success, data} format
        const savedJobsData = result.data || result;
        setSavedJobs(Array.isArray(savedJobsData) ? savedJobsData : []);
      } else {
        console.error('Failed to fetch saved jobs:', result.error);
        setSavedJobs([]);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/companies`);
      const result = await response.json();
      
      if (response.ok) {
        // Handle both direct array and {success, data} format
        const companiesData = result.data || result;
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
      } else {
        console.error('Failed to fetch companies:', result.error);
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/saved-jobs/${user.id}/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedJobs(savedJobs.filter(savedJob => savedJob.job_id !== jobId));
        alert('Job removed from saved jobs');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove job');
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
      alert('Failed to remove job');
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          jobId: jobId,
          status: 'applied'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Application submitted successfully!');
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to submit application');
    }
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-600">You need to be logged in to view your saved jobs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading saved jobs...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
        </div>
        <p className="text-gray-600">
          {savedJobs.length > 0 
            ? `You have ${savedJobs.length} saved job${savedJobs.length !== 1 ? 's' : ''}`
            : 'No saved jobs yet'
          }
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Saved Jobs Yet</h2>
            <p className="text-gray-500 mb-6">
              Start exploring jobs and save the ones that interest you for later!
            </p>
            <Button 
              onClick={() => window.location.href = '/jobs'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {savedJobs.map((savedJob) => {
            const job = savedJob; // Assuming the saved job object contains job details
            return (
              <Card key={savedJob.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant="secondary" className="capitalize">
                          {job.job_type}
                        </Badge>
                        {job.is_remote && (
                          <Badge variant="outline">Remote</Badge>
                        )}
                        <Badge variant="destructive" className="bg-green-100 text-green-800">
                          Saved
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Building size={16} />
                          {getCompanyName(job.company_id)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={16} />
                          {formatSalary(job.salary_min, job.salary_max)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          Saved {formatDate(savedJob.created_at)}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      {job.required_skills && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {job.required_skills.split(',').map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} />
                        <span>Job posted {formatDate(job.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      <Button 
                        onClick={() => handleApplyJob(job.id)}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink size={16} />
                        Apply Now
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        onClick={() => handleUnsaveJob(job.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
