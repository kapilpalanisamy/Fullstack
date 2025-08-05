import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";
import { BriefcaseBusiness, Heart, PenBox, User, LogOut, LayoutDashboard, Brain, Users, FileText, Shield, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import apiService from "../services/apiService";

const Header = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [backendConnected, setBackendConnected] = useState(null); // null = not tested, true = connected, false = disconnected

  const [search, setSearch] = useSearchParams();
  const { user, isAuthenticated, logout, switchRole } = useAuth();

  useEffect(() => {
    if (search.get("sign-in")) {
      setShowSignIn(true);
    }
  }, [search]);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      await apiService.checkHealth();
      setBackendConnected(true);
      alert("✅ Backend Connected Successfully!");
    } catch (error) {
      setBackendConnected(false);
      alert(`❌ Backend Connection Failed: ${error.message}`);
    }
  };

  useEffect(() => {
    if (search.get("sign-in")) {
      setShowSignIn(true);
    }
  }, [search]);

  const handleCloseAuth = () => {
    setShowSignIn(false);
    setSearch({});
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="py-4 flex justify-between items-center px-4 sm:px-0">
        <Link to="/">
          <img src="/logo.png" className="h-16 sm:h-20" alt="Job Portal Logo" />
        </Link>

        <div className="flex gap-2 sm:gap-8 items-center">
          {/* Backend Connection Status */}
          <Button
            variant="ghost"
            size="sm"
            onClick={testBackendConnection}
            className={`hidden sm:flex items-center gap-2 text-xs ${
              backendConnected === true ? 'text-green-600' : 
              backendConnected === false ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {backendConnected === true ? <Wifi size={16} /> : 
             backendConnected === false ? <WifiOff size={16} /> : <Wifi size={16} />}
            {backendConnected === true ? 'Backend OK' : 
             backendConnected === false ? 'Backend Error' : 'Test Backend'}
          </Button>

          {!isAuthenticated ? (
            <Button variant="outline" onClick={() => setShowSignIn(true)} className="text-sm sm:text-base">
              Login
            </Button>
          ) : (
            <>
              {user?.role === "recruiter" && (
                <Link to="/post-job" className="hidden sm:block">
                  <Button variant="destructive" className="rounded-full">
                    <PenBox size={20} className="mr-2" />
                    <span className="hidden sm:inline">Post a Job</span>
                    <span className="sm:hidden">Post</span>
                  </Button>
                </Link>
              )}
              
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="rounded-full flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">{user?.name || user?.fullName}</span>
                </Button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-background border rounded-md shadow-lg z-10">
                    {user?.role === "recruiter" && (
                      <Link
                        to="/post-job"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-accent sm:hidden"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <PenBox size={15} />
                        Post a Job
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link
                      to="/ai-jobs"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Brain size={15} />
                      AI Job Matches
                    </Link>
                    <Link
                      to="/my-jobs"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <BriefcaseBusiness size={15} />
                      My Jobs
                    </Link>
                    <Link
                      to="/saved-jobs"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Heart size={15} />
                      Saved Jobs
                    </Link>
                    <Link
                      to="/social"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Users size={15} />
                      Social Feed
                    </Link>
                    <Link
                      to="/job-matching"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Brain size={15} />
                      AI Job Matching
                    </Link>
                    <Link
                      to="/skill-analysis"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FileText size={15} />
                      Skill Analysis
                    </Link>
                    <Link
                      to="/backend-test"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Wifi size={15} />
                      Backend Test
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-accent border-t"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield size={15} />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-accent w-full text-left border-t"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={showSignIn}
        onClose={handleCloseAuth}
        defaultTab="login"
      />
    </>
  );
};

export default Header;
