import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "../contexts/AuthContext";

const AuthModal = ({ isOpen, onClose, defaultTab = "login" }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "candidate",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      let result;
      
      if (activeTab === "login") {
        // Login with backend
        result = await login(formData.email, formData.password);
      } else {
        // Register with backend
        result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
      }
      
      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Authentication failed");
      }
      
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
        <Card>
          <CardHeader>
            <CardTitle>{activeTab === "login" ? "Login" : "Sign Up"}</CardTitle>
            <CardDescription>
              {activeTab === "login" 
                ? "Enter your credentials to access your account"
                : "Create your account to get started"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={activeTab === "signup"}
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              {activeTab === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md bg-background"
                    disabled={isLoading}
                  >
                    <option value="candidate">Job Seeker</option>
                    <option value="recruiter">Employer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Please wait..." : (activeTab === "login" ? "Login" : "Create Account")}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
                className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {activeTab === "login" 
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Login"
                }
              </button>
            </div>

            <div className="mt-4">
              <Button variant="outline" onClick={onClose} className="w-full" disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthModal;
