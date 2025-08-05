import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Star, 
  TrendingUp, 
  Users, 
  Briefcase,
  Eye,
  Heart,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  DollarSign
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useJobs } from "../contexts/JobsContext";
import JobMatchingComponent from "../components/JobMatchingComponent";
import ProfileManagement from "./ProfileManagement";

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const { jobs, applications, updateApplicationStatus } = useJobs();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock user profile data
  const [userProfile] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john@example.com",
    bio: "Experienced full-stack developer with passion for React and Node.js",
    location: "California",
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS"],
    experience: "5+ years in web development",
    linkedinUrl: "https://linkedin.com/in/johndoe"
  });

  // Get user's applications
  const userApplications = applications?.filter(app => app.candidate_id === user?.id) || [];

  // Analytics for job seeker
  const [analytics] = useState({
    profileViews: 127,
    jobsApplied: userApplications.length,
    savedJobs: 15,
    matchScore: 85,
    pendingApplications: userApplications.filter(app => app.status === 'pending').length,
    interviewsScheduled: userApplications.filter(app => app.status === 'interview').length,
    rejections: userApplications.filter(app => app.status === 'rejected').length,
    offers: userApplications.filter(app => app.status === 'hired').length
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'reviewing': return <Eye size={16} />;
      case 'interview': return <Users size={16} />;
      case 'hired': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600">Track your job applications and discover new opportunities</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="matches">AI Matches</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Applications Sent</p>
                    <div className="text-2xl font-bold">{analytics.jobsApplied}</div>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <div className="text-2xl font-bold">{analytics.pendingApplications}</div>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Interviews</p>
                    <div className="text-2xl font-bold">{analytics.interviewsScheduled}</div>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Job Offers</p>
                    <div className="text-2xl font-bold">{analytics.offers}</div>
                  </div>
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Application Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Application Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userApplications.slice(0, 5).map((application, index) => {
                  const job = jobs.find(j => j.id === application.job_id);
                  return (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{job?.title}</p>
                        <p className="text-sm text-gray-600">{job?.company?.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {userApplications.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No applications yet. Start applying to jobs!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Job Applications</CardTitle>
              <p className="text-gray-600">Track the status of all your job applications</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userApplications.map((application) => {
                  const job = jobs.find(j => j.id === application.job_id);
                  const deadlinePassed = isDeadlinePassed(job?.deadline);
                  
                  return (
                    <div key={application.id} className="border rounded-lg p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{job?.title}</h3>
                          <p className="text-gray-600">{job?.company?.name}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {job?.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              {job?.salary_min && job?.salary_max 
                                ? `$${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()}`
                                : job?.salary || 'Salary not specified'
                              }
                            </span>
                            {job?.deadline && (
                              <span className={`flex items-center gap-1 ${deadlinePassed ? 'text-red-500' : 'text-gray-500'}`}>
                                <Calendar size={14} />
                                Deadline: {new Date(job.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge className={`${getStatusColor(application.status)} border-none`}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1 capitalize">{application.status}</span>
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied: {new Date(application.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {application.status === 'interview' && application.interview_date && (
                        <Alert className="border-green-200 bg-green-50">
                          <Calendar size={16} className="text-green-600" />
                          <AlertDescription className="text-green-800">
                            <strong>Interview Scheduled:</strong> {new Date(application.interview_date).toLocaleString()}
                          </AlertDescription>
                        </Alert>
                      )}

                      {application.status === 'rejected' && application.feedback && (
                        <Alert className="border-red-200 bg-red-50">
                          <MessageSquare size={16} className="text-red-600" />
                          <AlertDescription className="text-red-800">
                            <strong>Feedback:</strong> {application.feedback}
                          </AlertDescription>
                        </Alert>
                      )}

                      {application.status === 'hired' && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle size={16} className="text-green-600" />
                          <AlertDescription className="text-green-800">
                            🎉 <strong>Congratulations!</strong> You've been selected for this position.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Job Details
                        </Button>
                        {application.status === 'pending' && (
                          <Button size="sm" variant="ghost" className="text-red-600">
                            Withdraw Application
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {userApplications.length === 0 && (
                  <div className="text-center py-12">
                    <Briefcase size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-4">Start your job search journey by applying to positions that match your skills.</p>
                    <Button>Browse Jobs</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <JobMatchingComponent jobs={jobs} userProfile={userProfile} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <ProfileManagement />
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <p className="text-gray-600">Jobs you've saved for later</p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Heart size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Jobs</h3>
                <p className="text-gray-600 mb-4">Save interesting job postings to review them later.</p>
                <Button>Browse Jobs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobSeekerDashboard;
