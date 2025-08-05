import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Briefcase, 
  BookmarkPlus, 
  FileText, 
  TrendingUp,
  MapPin,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ProfileManagement from "./ProfileManagement";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    savedJobs: 0,
    profileViews: 0,
    pendingApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch applications
      const applicationsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/user/${user.id}`);
      const applicationsResult = await applicationsResponse.json();

      // Fetch saved jobs
      const savedJobsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/saved-jobs/${user.id}`);
      const savedJobsResult = await savedJobsResponse.json();

      if (applicationsResponse.ok) {
        // Handle both direct array and {success, data} format
        const applicationsData = applicationsResult.data || applicationsResult;
        const applications = Array.isArray(applicationsData) ? applicationsData : [];
        
        setRecentApplications(applications.slice(0, 5)); // Get last 5 applications
        setStats(prev => ({
          ...prev,
          totalApplications: applications.length,
          pendingApplications: applications.filter(app => app.status === 'applied').length
        }));
      }

      if (savedJobsResponse.ok) {
        // Handle both direct array and {success, data} format
        const savedJobsData = savedJobsResult.data || savedJobsResult;
        const savedJobs = Array.isArray(savedJobsData) ? savedJobsData : [];
        
        setSavedJobs(savedJobs.slice(0, 5)); // Get last 5 saved jobs
        setStats(prev => ({
          ...prev,
          savedJobs: savedJobs.length
        }));
      }

      // Mock profile views for now
      setStats(prev => ({
        ...prev,
        profileViews: Math.floor(Math.random() * 50) + 10
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty arrays on error
      setRecentApplications([]);
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'interviewing': return 'bg-purple-100 text-purple-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied': return <Clock size={16} />;
      case 'reviewing': return <FileText size={16} />;
      case 'interviewing': return <User size={16} />;
      case 'offered': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
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
        <p className="text-gray-600">You need to be logged in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">Here's your job search overview</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">All time applications</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
                <BookmarkPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.savedJobs}</div>
                <p className="text-xs text-muted-foreground">Jobs bookmarked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                <p className="text-xs text-muted-foreground">Awaiting response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.profileViews}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  Recent Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{application.title || 'Job Title'}</h4>
                          <p className="text-sm text-gray-600">{application.company_name || 'Company'}</p>
                          <p className="text-xs text-gray-500">{formatDate(application.created_at)}</p>
                        </div>
                        <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                          {getStatusIcon(application.status)}
                          {application.status}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Applications
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-500">No applications yet</p>
                    <Button variant="outline" className="mt-2" onClick={() => window.location.href = '/jobs'}>
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Saved Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookmarkPlus size={20} />
                  Recently Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : savedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {savedJobs.map((job) => (
                      <div key={job.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{job.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Building size={14} />
                          <span>{job.company_name || 'Company'}</span>
                          <MapPin size={14} />
                          <span>{job.location}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Saved {formatDate(job.created_at)}</p>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Saved Jobs
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookmarkPlus className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-500">No saved jobs yet</p>
                    <Button variant="outline" className="mt-2" onClick={() => window.location.href = '/jobs'}>
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <p className="text-gray-600">Track all your job applications</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading applications...</p>
              ) : recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm">
                      <div className="flex-1">
                        <h4 className="font-semibold">{application.title || 'Job Title'}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Building size={14} />
                            {application.company_name || 'Company'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Applied {formatDate(application.created_at)}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                        {getStatusIcon(application.status)}
                        {application.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Applications Yet</h3>
                  <p className="text-gray-500 mb-6">Start applying to jobs to see them here!</p>
                  <Button onClick={() => window.location.href = '/jobs'}>
                    Browse Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <p className="text-gray-600">Jobs you've bookmarked for later</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading saved jobs...</p>
              ) : savedJobs.length > 0 ? (
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg hover:shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{job.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Building size={14} />
                              {job.company_name || 'Company'}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              Saved {formatDate(job.created_at)}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => window.location.href = `/jobs/${job.id}`}>
                          View Job
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/saved-jobs'}>
                    View All Saved Jobs
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookmarkPlus className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Saved Jobs</h3>
                  <p className="text-gray-500 mb-6">Save interesting jobs to review them later!</p>
                  <Button onClick={() => window.location.href = '/jobs'}>
                    Browse Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <ProfileManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
