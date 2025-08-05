import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Briefcase,
  Eye,
  Users,
  Star,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useJobs } from "../contexts/JobsContext";
import { Link } from "react-router-dom";

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { jobs, applications, updateApplicationStatus, isDeadlinePassed } = useJobs();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get recruiter's jobs and applications
  const recruiterJobs = jobs?.filter(job => job.recruiter_id === user?.id) || [];
  const recruiterApplications = applications?.filter(app => 
    recruiterJobs.some(job => job.id === app.job_id)
  ) || [];

  // Analytics for recruiter
  const analytics = {
    jobsPosted: recruiterJobs.length,
    totalApplications: recruiterApplications.length,
    pendingApplications: recruiterApplications.filter(app => app.status === 'pending').length,
    interviewsScheduled: recruiterApplications.filter(app => app.status === 'interview').length,
    candidatesHired: recruiterApplications.filter(app => app.status === 'hired').length,
    activeJobs: recruiterJobs.filter(job => !isDeadlinePassed(job.deadline)).length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interview': return 'bg-green-100 text-green-800 border-green-200';
      case 'hired': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleStatusUpdate = async (applicationId, newStatus, feedback = null, interviewDate = null) => {
    try {
      await updateApplicationStatus(applicationId, newStatus, feedback, interviewDate);
      // Refresh data or update local state
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

  const filteredApplications = recruiterApplications.filter(app => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      app.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobs.find(j => j.id === app.job_id)?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruiter Dashboard 💼</h1>
          <p className="text-gray-600">Manage your job postings and review candidates</p>
        </div>
        <Link to="/post-job">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Post New Job
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Jobs Posted</p>
                    <div className="text-2xl font-bold">{analytics.jobsPosted}</div>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <div className="text-2xl font-bold">{analytics.totalApplications}</div>
                  </div>
                  <Eye className="h-8 w-8 text-green-600" />
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
                    <p className="text-sm font-medium text-gray-600">Candidates Hired</p>
                    <div className="text-2xl font-bold">{analytics.candidatesHired}</div>
                  </div>
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recruiterApplications.slice(0, 5).map((application) => {
                  const job = jobs.find(j => j.id === application.job_id);
                  return (
                    <div key={application.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{application.candidate_name}</p>
                        <p className="text-sm text-gray-600">{job?.title}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(application.status)} border`}>
                          {application.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {recruiterApplications.length === 0 && (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No applications yet. Post jobs to start receiving applications!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search candidates or jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Applications ({filteredApplications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const job = jobs.find(j => j.id === application.job_id);
                  return (
                    <ApplicationCard 
                      key={application.id}
                      application={application}
                      job={job}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  );
                })}
                
                {filteredApplications.length === 0 && (
                  <div className="text-center py-12">
                    <Users size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                    <p className="text-gray-600">No applications match your current filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recruiterJobs.map((job) => {
                  const jobApplications = applications?.filter(app => app.job_id === job.id) || [];
                  const deadlinePassed = isDeadlinePassed(job.deadline);
                  
                  return (
                    <div key={job.id} className="border rounded-lg p-6 space-y-4">
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
                              {job.salary_min && job.salary_max 
                                ? `$${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()}`
                                : 'Salary not specified'
                              }
                            </span>
                            {job.deadline && (
                              <span className={`flex items-center gap-1 ${deadlinePassed ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                <Calendar size={14} />
                                Deadline: {new Date(job.deadline).toLocaleDateString()}
                                {deadlinePassed && <Badge variant="destructive" className="ml-2">Expired</Badge>}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{jobApplications.length}</div>
                          <p className="text-sm text-gray-500">Applications</p>
                        </div>
                      </div>

                      {deadlinePassed && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertCircle size={16} className="text-red-600" />
                          <AlertDescription className="text-red-800">
                            This job posting has expired. Candidates can no longer apply.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Edit size={14} />
                            Edit Job
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 flex items-center gap-1">
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </div>
                        
                        <Button size="sm" onClick={() => setSelectedJob(job)}>
                          View Applications ({jobApplications.length})
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {recruiterJobs.length === 0 && (
                  <div className="text-center py-12">
                    <Briefcase size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Posted</h3>
                    <p className="text-gray-600 mb-4">Start by posting your first job to attract candidates.</p>
                    <Link to="/post-job">
                      <Button>Post Your First Job</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { status: 'pending', count: analytics.pendingApplications, color: 'bg-yellow-100 text-yellow-800' },
                    { status: 'reviewing', count: recruiterApplications.filter(app => app.status === 'reviewing').length, color: 'bg-blue-100 text-blue-800' },
                    { status: 'interview', count: analytics.interviewsScheduled, color: 'bg-green-100 text-green-800' },
                    { status: 'hired', count: analytics.candidatesHired, color: 'bg-green-100 text-green-800' },
                    { status: 'rejected', count: recruiterApplications.filter(app => app.status === 'rejected').length, color: 'bg-red-100 text-red-800' }
                  ].map(({ status, count, color }) => (
                    <div key={status} className="flex justify-between items-center p-3 border rounded">
                      <span className="capitalize font-medium">{status}</span>
                      <Badge className={`${color} border-none`}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Active Jobs</span>
                    <Badge variant="outline">{analytics.activeJobs}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Expired Jobs</span>
                    <Badge variant="outline">{analytics.jobsPosted - analytics.activeJobs}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span>Avg Applications per Job</span>
                    <Badge variant="outline">
                      {analytics.jobsPosted > 0 ? Math.round(analytics.totalApplications / analytics.jobsPosted) : 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Application Card Component
const ApplicationCard = ({ application, job, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [interviewDate, setInterviewDate] = useState("");

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'rejected' && !showFeedbackForm) {
      setShowFeedbackForm(true);
      return;
    }

    if (newStatus === 'interview' && !interviewDate) {
      // Show interview date picker
      const date = prompt("Enter interview date and time (YYYY-MM-DD HH:MM):");
      if (!date) return;
      setInterviewDate(date);
    }

    setIsUpdating(true);
    try {
      await onStatusUpdate(application.id, newStatus, feedback, interviewDate);
      setShowFeedbackForm(false);
      setFeedback("");
      setInterviewDate("");
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{application.candidate_name}</h4>
          <p className="text-gray-600">{job?.title}</p>
          <p className="text-sm text-gray-500">Applied: {new Date(application.applied_at).toLocaleDateString()}</p>
        </div>
        <Badge className={`${getStatusColor(application.status)} border`}>
          {application.status}
        </Badge>
      </div>

      {showFeedbackForm && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <Label htmlFor="feedback">Rejection Feedback (Optional)</Label>
          <Textarea
            id="feedback"
            placeholder="Provide feedback to help the candidate improve..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
          />
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {application.status === 'pending' && (
          <>
            <Button 
              size="sm" 
              onClick={() => handleStatusChange('reviewing')}
              disabled={isUpdating}
            >
              Start Review
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStatusChange('interview')}
              disabled={isUpdating}
            >
              Schedule Interview
            </Button>
          </>
        )}
        
        {application.status === 'reviewing' && (
          <>
            <Button 
              size="sm"
              onClick={() => handleStatusChange('interview')}
              disabled={isUpdating}
            >
              Schedule Interview
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStatusChange('hired')}
              disabled={isUpdating}
            >
              Hire Candidate
            </Button>
          </>
        )}

        {application.status === 'interview' && (
          <Button 
            size="sm"
            onClick={() => handleStatusChange('hired')}
            disabled={isUpdating}
          >
            Hire Candidate
          </Button>
        )}

        {['pending', 'reviewing', 'interview'].includes(application.status) && (
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => handleStatusChange('rejected')}
            disabled={isUpdating}
          >
            Reject
          </Button>
        )}

        {showFeedbackForm && (
          <div className="flex gap-2 w-full">
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleStatusChange('rejected')}
              disabled={isUpdating}
              className="flex-1"
            >
              Confirm Rejection
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowFeedbackForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
