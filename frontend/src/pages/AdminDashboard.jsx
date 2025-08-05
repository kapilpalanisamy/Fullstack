import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../contexts/AuthContext";
import { useJobs } from "../contexts/JobsContext";
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  DollarSign,
  Activity,
  PieChart,
  Zap,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  Search,
  RefreshCw
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { jobs: contextJobs, applications: contextApplications } = useJobs();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);

  // Enhanced stats with real data integration
  const [stats, setStats] = useState(() => ({
    totalUsers: 1247,
    totalJobs: contextJobs?.length || 89,
    totalPosts: 342,
    activeApplications: contextApplications?.length || 156,
    revenue: 12450,
    conversionRate: 8.5,
    pendingReviews: contextApplications?.filter(app => app.status === 'pending').length || 23,
    systemHealth: 98.5
  }));

  // Update stats when context data changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalJobs: contextJobs?.length || prev.totalJobs,
      activeApplications: contextApplications?.length || prev.activeApplications,
      pendingReviews: contextApplications?.filter(app => app.status === 'pending').length || prev.pendingReviews,
    }));
  }, [contextJobs, contextApplications]);

  // Refresh function
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalJobs: contextJobs?.length || prev.totalJobs,
        activeApplications: contextApplications?.length || prev.activeApplications,
        pendingReviews: contextApplications?.filter(app => app.status === 'pending').length || prev.pendingReviews,
        systemHealth: Math.min(100, prev.systemHealth + Math.random() * 2 - 1)
      }));
      
      addNotification("Dashboard refreshed successfully", "success");
    } catch (error) {
      addNotification("Failed to refresh dashboard", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Notification system
  const addNotification = (message, type = "info") => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "candidate", status: "active", joinDate: "2024-01-15", applications: 5 },
    { id: 2, name: "Jane Smith", email: "jane@company.com", role: "recruiter", status: "active", joinDate: "2024-02-20", jobsPosted: 12 },
    { id: 3, name: "Mike Johnson", email: "mike@tech.com", role: "candidate", status: "suspended", joinDate: "2024-01-10", applications: 2 },
    { id: 4, name: "Sarah Wilson", email: "sarah@startup.com", role: "recruiter", status: "active", joinDate: "2024-03-05", jobsPosted: 8 }
  ]);

  const [jobs, setJobs] = useState([
    { id: 1, title: "Senior React Developer", company: "TechCorp", status: "active", applications: 23, postedDate: "2024-03-01", salary: "$120k" },
    { id: 2, title: "Product Manager", company: "StartupHub", status: "active", applications: 15, postedDate: "2024-03-05", salary: "$95k" },
    { id: 3, title: "Data Scientist", company: "AI Labs", status: "paused", applications: 8, postedDate: "2024-02-28", salary: "$110k" },
    { id: 4, title: "UX Designer", company: "Design Co", status: "active", applications: 12, postedDate: "2024-03-03", salary: "$85k" }
  ]);

  const [posts, setPosts] = useState([
    { id: 1, author: "Sarah Johnson", content: "Just landed my dream job at a tech startup!", type: "career_advice", likes: 12, reports: 0, status: "approved" },
    { id: 2, author: "Mike Chen", content: "Remote work tips for virtual interviews...", type: "tips", likes: 28, reports: 1, status: "flagged" },
    { id: 3, author: "TechCorp", content: "We're hiring 5 new engineers!", type: "job_update", likes: 45, reports: 0, status: "approved" }
  ]);

  const handleUserAction = (userId, action) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'activate':
            return { ...user, status: 'active' };
          case 'suspend':
            return { ...user, status: 'suspended' };
          case 'delete':
            return null;
          default:
            return user;
        }
      }
      return user;
    }).filter(Boolean));
  };

  const handleJobAction = (jobId, action) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        switch (action) {
          case 'activate':
            return { ...job, status: 'active' };
          case 'pause':
            return { ...job, status: 'paused' };
          case 'delete':
            return null;
          default:
            return job;
        }
      }
      return job;
    }).filter(Boolean));
  };

  const handlePostAction = (postId, action) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        switch (action) {
          case 'approve':
            return { ...post, status: 'approved' };
          case 'flag':
            return { ...post, status: 'flagged' };
          case 'delete':
            return null;
          default:
            return post;
        }
      }
      return post;
    }).filter(Boolean));
  };

  const openEditModal = (item, type) => {
    setEditingItem({ ...item, type });
    setIsEditModalOpen(true);
  };

  const saveEdit = () => {
    if (editingItem.type === 'user') {
      setUsers(users.map(user => user.id === editingItem.id ? editingItem : user));
    } else if (editingItem.type === 'job') {
      setJobs(jobs.map(job => job.id === editingItem.id ? editingItem : job));
    } else if (editingItem.type === 'post') {
      setPosts(posts.map(post => post.id === editingItem.id ? editingItem : post));
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Alert 
            key={notification.id}
            className={`w-80 transition-all duration-300 transform ${
              notification.type === 'success' ? 'bg-green-50 border-green-200' :
              notification.type === 'error' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {notification.type === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
              {notification.type === 'info' && <AlertTriangle className="h-4 w-4 text-blue-600" />}
              <AlertDescription className="text-sm font-medium">
                {notification.message}
              </AlertDescription>
            </div>
          </Alert>
        ))}
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header with Actions */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Control Center
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  Welcome back, <span className="font-semibold text-blue-600">{user?.name || 'Administrator'}</span>. 
                  Here's your platform overview.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  variant="outline"
                  className="gap-2 bg-white/50 hover:bg-white/80 transition-all duration-200"
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                  {isLoading ? "Refreshing..." : "Refresh"}
                </Button>
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Shield size={24} className="text-white" />
                </div>
                <Badge variant="outline" className="px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 font-semibold">
                  Admin Access
                </Badge>
              </div>
            </div>
            
            {/* System Health Indicator */}
            <div className="mt-6 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  stats.systemHealth > 95 ? 'bg-green-500' : 
                  stats.systemHealth > 85 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-slate-600">
                  System Health: <span className="font-semibold">{stats.systemHealth.toFixed(1)}%</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-500" />
                <span className="text-sm text-slate-600">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-0 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-blue-200 mt-1">+12% from last month</p>
                  </div>
                  <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Users size={28} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white border-0 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Active Jobs</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalJobs}</p>
                    <p className="text-xs text-emerald-200 mt-1">+8% this week</p>
                  </div>
                  <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Briefcase size={28} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-0 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Social Posts</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalPosts}</p>
                    <p className="text-xs text-purple-200 mt-1">+15% engagement</p>
                  </div>
                  <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <MessageSquare size={28} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white border-0 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Applications</p>
                    <p className="text-3xl font-bold mt-1">{stats.activeApplications}</p>
                    <p className="text-xs text-orange-200 mt-1">+5% today</p>
                  </div>
                  <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Activity size={28} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 text-white border-0 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Revenue</p>
                    <p className="text-3xl font-bold mt-1">${stats.revenue.toLocaleString()}</p>
                    <p className="text-xs text-teal-200 mt-1">+22% this month</p>
                  </div>
                  <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <DollarSign size={28} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group hover:scale-105 transition-all duration-300">
            <Card className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 text-white border-0 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Pending Reviews</p>
                    <p className="text-3xl font-bold mt-1">{stats.pendingReviews}</p>
                    <p className="text-xs text-pink-200 mt-1">Needs attention</p>
                  </div>
                  <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Clock size={28} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Download size={16} />
                Export Data
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings size={16} />
                Settings
              </Button>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Zap size={16} />
                Send Broadcast
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-5 bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-2 shadow-lg">
              <TabsTrigger 
                value="overview" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
              >
                <BarChart3 size={16} className="mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
              >
                <Users size={16} className="mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="jobs"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
              >
                <Briefcase size={16} className="mr-2" />
                Jobs
              </TabsTrigger>
              <TabsTrigger 
                value="posts"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
              >
                <MessageSquare size={16} className="mr-2" />
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
              >
                <Settings size={16} className="mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-white/20">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Activity size={20} className="text-white" />
                    </div>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl hover:shadow-md transition-all duration-300">
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <UserCheck size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">5 new users registered</p>
                        <p className="text-sm text-gray-600">2 hours ago</p>
                      </div>
                      <div className="text-xs bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                        New
                      </div>
                    </div>
                    
                    <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl hover:shadow-md transition-all duration-300">
                      <div className="h-12 w-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Briefcase size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">3 new jobs posted</p>
                        <p className="text-sm text-gray-600">4 hours ago</p>
                      </div>
                      <div className="text-xs bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-medium">
                        Active
                      </div>
                    </div>
                    
                    <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl hover:shadow-md transition-all duration-300">
                      <div className="h-12 w-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <AlertTriangle size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">1 post flagged for review</p>
                        <p className="text-sm text-gray-600">6 hours ago</p>
                      </div>
                      <div className="text-xs bg-orange-200 text-orange-800 px-3 py-1 rounded-full font-medium">
                        Review
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-white/20">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <PieChart size={20} className="text-white" />
                    </div>
                    Platform Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                          <TrendingUp size={14} className="text-white" />
                        </div>
                        <span className="font-medium text-gray-700">User Growth Rate</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                        +12.5%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                          <Briefcase size={14} className="text-white" />
                        </div>
                        <span className="font-medium text-gray-700">Job Success Rate</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                        87.3%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg flex items-center justify-center">
                          <Activity size={14} className="text-white" />
                        </div>
                        <span className="font-medium text-gray-700">Platform Engagement</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0 shadow-lg">
                        High
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                          <Shield size={14} className="text-white" />
                        </div>
                        <span className="font-medium text-gray-700">Content Quality</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 shadow-lg">
                        95.2%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="animate-in fade-in-50 duration-500">
            <Card className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-white/20">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  User Management
                </CardTitle>
                <CardDescription className="text-slate-600 mt-2">
                  Manage user accounts, roles, and permissions across the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <TableHead className="font-semibold text-slate-700">Name</TableHead>
                        <TableHead className="font-semibold text-slate-700">Email</TableHead>
                        <TableHead className="font-semibold text-slate-700">Role</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700">Join Date</TableHead>
                        <TableHead className="font-semibold text-slate-700">Activity</TableHead>
                        <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 border-b border-slate-100">
                          <TableCell className="font-medium text-slate-800">{user.name}</TableCell>
                          <TableCell className="text-slate-600">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'recruiter' ? 'default' : 'secondary'} className="rounded-full">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="rounded-full">
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600">{user.joinDate}</TableCell>
                          <TableCell className="text-slate-600">
                            {user.applications ? `${user.applications} applications` : `${user.jobsPosted} jobs posted`}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEditModal(user, 'user')} className="hover:bg-blue-50 hover:border-blue-300 rounded-xl">
                                <Edit size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant={user.status === 'active' ? 'destructive' : 'default'}
                                onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                                className="rounded-xl"
                              >
                                {user.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleUserAction(user.id, 'delete')} className="rounded-xl">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase size={20} />
                  Job Management
                </CardTitle>
                <CardDescription>
                  Monitor and manage all job postings on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.applications}</TableCell>
                        <TableCell>{job.postedDate}</TableCell>
                        <TableCell>{job.salary}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditModal(job, 'job')}>
                              <Edit size={14} />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant={job.status === 'active' ? 'secondary' : 'default'}
                              onClick={() => handleJobAction(job.id, job.status === 'active' ? 'pause' : 'activate')}
                            >
                              {job.status === 'active' ? 'Pause' : 'Activate'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleJobAction(job.id, 'delete')}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare size={20} />
                  Content Moderation
                </CardTitle>
                <CardDescription>
                  Review and moderate social feed posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Author</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.author}</TableCell>
                        <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{post.type.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>{post.likes} likes</TableCell>
                        <TableCell>
                          {post.reports > 0 && (
                            <Badge variant="destructive">{post.reports} reports</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.status === 'approved' ? 'default' : 'destructive'}>
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditModal(post, 'post')}>
                              <Edit size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant={post.status === 'approved' ? 'destructive' : 'default'}
                              onClick={() => handlePostAction(post.id, post.status === 'approved' ? 'flag' : 'approve')}
                            >
                              {post.status === 'approved' ? 'Flag' : 'Approve'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handlePostAction(post.id, 'delete')}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings size={20} />
                    Platform Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" defaultValue="RizeOS Jobs" />
                  </div>
                  <div>
                    <Label htmlFor="max-applications">Max Applications per Job</Label>
                    <Input id="max-applications" type="number" defaultValue="100" />
                  </div>
                  <div>
                    <Label htmlFor="job-posting-fee">Job Posting Fee ($)</Label>
                    <Input id="job-posting-fee" type="number" defaultValue="29.99" />
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield size={20} />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content-filter">Content Auto-Filter</Label>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="spam-protection">Spam Protection</Label>
                    <Button variant="outline" size="sm">Active</Button>
                  </div>
                  <Button>Update Security</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Edit {editingItem?.type}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Make changes to the {editingItem?.type} details below.
              </DialogDescription>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-6">
                {editingItem.type === 'user' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="edit-name" className="text-sm font-semibold text-slate-700">Name</Label>
                      <Input 
                        id="edit-name" 
                        value={editingItem.name} 
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email" className="text-sm font-semibold text-slate-700">Email</Label>
                      <Input 
                        id="edit-email" 
                        value={editingItem.email} 
                        onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                        className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-role" className="text-sm font-semibold text-slate-700">Role</Label>
                      <Select 
                        value={editingItem.role} 
                        onValueChange={(value) => setEditingItem({...editingItem, role: value})}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="candidate">Candidate</SelectItem>
                          <SelectItem value="recruiter">Recruiter</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {editingItem.type === 'job' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="edit-title" className="text-sm font-semibold text-slate-700">Job Title</Label>
                      <Input 
                        id="edit-title" 
                        value={editingItem.title} 
                        onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                        className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-company" className="text-sm font-semibold text-slate-700">Company</Label>
                      <Input 
                        id="edit-company" 
                        value={editingItem.company} 
                        onChange={(e) => setEditingItem({...editingItem, company: e.target.value})}
                        className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-salary" className="text-sm font-semibold text-slate-700">Salary</Label>
                      <Input 
                        id="edit-salary" 
                        value={editingItem.salary} 
                        onChange={(e) => setEditingItem({...editingItem, salary: e.target.value})}
                        className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                  </>
                )}

                {editingItem.type === 'post' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="edit-author" className="text-sm font-semibold text-slate-700">Author</Label>
                      <Input 
                        id="edit-author" 
                        value={editingItem.author} 
                        onChange={(e) => setEditingItem({...editingItem, author: e.target.value})}
                        className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-content" className="text-sm font-semibold text-slate-700">Content</Label>
                      <Textarea 
                        id="edit-content" 
                        value={editingItem.content} 
                        onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                        rows={3}
                        className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-xl border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveEdit}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
