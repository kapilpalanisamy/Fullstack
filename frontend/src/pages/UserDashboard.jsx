import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Star, 
  TrendingUp, 
  Users, 
  Briefcase,
  Eye,
  Heart,
  MessageSquare
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useJobs } from "../contexts/JobsContext";
import JobMatchingComponent from "../components/JobMatchingComponent";
import ProfileManagement from "./ProfileManagement";

const Dashboard = () => {
  const { user } = useAuth();
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock user profile data - in real app, this would come from API
  const [userProfile] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john@example.com",
    bio: "Experienced full-stack developer with passion for React and Node.js",
    location: "California",
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS"],
    experience: "5+ years in web development",
    linkedinUrl: "https://linkedin.com/in/johndoe"
  });

  // Mock analytics data
  const [analytics] = useState({
    profileViews: 127,
    jobsApplied: 23,
    savedJobs: 15,
    matchScore: 85
  });

  const [recentActivity] = useState([
    { type: "view", job: "Senior React Developer", company: "Tech Corp", time: "2 hours ago" },
    { type: "apply", job: "Full Stack Engineer", company: "StartupXYZ", time: "1 day ago" },
    { type: "save", job: "Frontend Lead", company: "BigTech", time: "2 days ago" },
  ]);

  if (user?.role === "recruiter") {
    return <RecruiterDashboard />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600">Here's your personalized job search dashboard</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">AI Matches</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Views</p>
                    <div className="text-2xl font-bold">{analytics.profileViews}</div>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Jobs Applied</p>
                    <div className="text-2xl font-bold">{analytics.jobsApplied}</div>
                  </div>
                  <Briefcase className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                    <div className="text-2xl font-bold">{analytics.savedJobs}</div>
                  </div>
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Match Score</p>
                    <div className="text-2xl font-bold">{analytics.matchScore}%</div>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col gap-2" variant="outline">
                  <TrendingUp size={24} />
                  <span>Update Skills</span>
                </Button>
                <Button className="h-20 flex flex-col gap-2" variant="outline">
                  <Users size={24} />
                  <span>Network</span>
                </Button>
                <Button className="h-20 flex flex-col gap-2" variant="outline">
                  <Star size={24} />
                  <span>Get Premium</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'view' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'apply' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {activity.type === 'view' ? <Eye size={16} /> :
                       activity.type === 'apply' ? <Briefcase size={16} /> :
                       <Heart size={16} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.job}</p>
                      <p className="text-sm text-gray-600">{activity.company}</p>
                    </div>
                    <Badge variant="outline">{activity.time}</Badge>
                  </div>
                ))}
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

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Your activity feed will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Recruiter Dashboard
const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [analytics] = useState({
    jobsPosted: 12,
    applications: 145,
    candidates: 67,
    hired: 8
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruiter Dashboard 💼</h1>
          <p className="text-gray-600">Manage your job postings and candidates</p>
        </div>
        <Button>Post New Job</Button>
      </div>

      {/* Recruiter Analytics */}
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
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <div className="text-2xl font-bold">{analytics.applications}</div>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Candidates</p>
                <div className="text-2xl font-bold">{analytics.candidates}</div>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <div className="text-2xl font-bold">{analytics.hired}</div>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Job Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Your job postings will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
