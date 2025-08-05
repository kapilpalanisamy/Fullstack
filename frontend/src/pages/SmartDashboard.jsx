import { useAuth } from "../contexts/AuthContext";
import JobSeekerDashboard from "./JobSeekerDashboard";
import RecruiterDashboard from "./RecruiterDashboard";

const SmartDashboard = () => {
  const { user } = useAuth();

  console.log("SmartDashboard: User data:", user);
  console.log("SmartDashboard: User role:", user?.role);

  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  if (user?.role === "recruiter") {
    console.log("SmartDashboard: Rendering RecruiterDashboard");
    return <RecruiterDashboard />;
  } else {
    console.log("SmartDashboard: Rendering JobSeekerDashboard");
    return <JobSeekerDashboard />;
  }
};

export default SmartDashboard;
