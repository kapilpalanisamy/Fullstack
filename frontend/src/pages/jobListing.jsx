import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building, 
  Clock, 
  DollarSign, 
  Users, 
  Search,
  Filter,
  BookmarkPlus,
  ExternalLink,
  Calendar
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const JobListing = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [jobType, setJobType] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`);
      const result = await response.json();
      
      if (response.ok) {
        // Handle both direct array and {success, data} format
        const jobsData = result.data || result;
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } else {
        console.error('Failed to fetch jobs:', result.error);
        setJobs([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/companies');
      const result = await response.json();
      
      if (response.ok) {
        // Handle both direct array and {success, data} format
        const companiesData = result.data || result;
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
      } else {
        console.error('Failed to fetch companies:', result.error);
        setCompanies([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]); // Set empty array on error
    }
  };

  const handleSaveJob = async (jobId) => {
    if (!user) {
      alert('Please login to save jobs');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/saved-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          jobId: jobId
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Job saved successfully!');
      } else {
        alert(data.error || 'Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job');
    }
  };

  const handleApplyJob = async (job) => {
    if (!user) {
      alert('Please login to apply for jobs');
      return;
    }

    // Check if deadline has passed
    if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
      alert('Application deadline has passed. You cannot apply for this job.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          job_id: job.id,
          status: 'pending'
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

  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !selectedCompany || job.company_id === selectedCompany;
    const matchesLocation = !selectedLocation || job.location?.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesJobType = !jobType || job.job_type === jobType;
    
    return matchesSearch && matchesCompany && matchesLocation && matchesJobType;
  }) : [];

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading jobs...</div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white-900 mb-2">Find Your Dream Job</h1>
        <p className="text-white-600">Discover opportunities from top companies</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search jobs by title, skills, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

              <Input
                placeholder="Location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="min-w-[150px]"
              />

              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white-900">{job.title}</h3>
                      <Badge variant="secondary" className="capitalize">
                        {job.job_type}
                      </Badge>
                      {job.is_remote && (
                        <Badge variant="outline">Remote</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-white-600 mb-3">
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
                        {formatDate(job.created_at)}
                      </div>
                      {job.application_deadline && (
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span className={new Date(job.application_deadline) < new Date() ? 'text-red-500' : 'text-green-600'}>
                            Deadline: {formatDate(job.application_deadline)}
                          </span>
                        </div>
                      )}
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
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    {job.application_deadline && new Date(job.application_deadline) < new Date() ? (
                      <Button 
                        disabled
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Clock size={16} />
                        Deadline Passed
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleApplyJob(job)}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink size={16} />
                        Apply Now
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleSaveJob(job.id)}
                      className="flex items-center gap-2"
                    >
                      <BookmarkPlus size={16} />
                      Save Job
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JobListing;
