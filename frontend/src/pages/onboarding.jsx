import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import WalletConnection from "../components/WalletConnection";

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    linkedinUrl: "",
    skills: user?.skills?.join(", ") || "",
    walletAddress: user?.walletAddress || "",
  });

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelection = (role) => {
    updateUser({ role });
    setStep(2);
  };

  const handleWalletConnect = (address, walletType) => {
    setProfileData({
      ...profileData,
      walletAddress: address,
    });
    setStep(3);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    const updatedUser = {
      ...profileData,
      skills: profileData.skills.split(",").map(skill => skill.trim()).filter(skill => skill),
    };
    
    updateUser(updatedUser);
    navigate(user?.role === "recruiter" ? "/post-job" : "/jobs");
  };

  if (step === 1) {
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <h2 className="gradient-title font-extrabold text-7xl sm:text-8xl tracking-tighter">
          I am a...
        </h2>
        <div className="mt-16 grid grid-cols-2 gap-4 w-full md:px-40">
          <Button
            variant="blue"
            className="h-36 text-2xl"
            onClick={() => handleRoleSelection("candidate")}
          >
            Job Seeker
          </Button>
          <Button
            variant="destructive"
            className="h-36 text-2xl"
            onClick={() => handleRoleSelection("recruiter")}
          >
            Employer
          </Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex items-center justify-center mt-20">
        <div className="w-full max-w-2xl">
          <h2 className="gradient-title font-extrabold text-4xl sm:text-6xl text-center mb-8">
            Connect Your Wallet
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Connect your Web3 wallet to enable blockchain payments and features
          </p>
          <WalletConnection onConnect={handleWalletConnect} />
          <div className="text-center mt-6">
            <Button variant="outline" onClick={() => setStep(3)}>
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-20">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us personalize your experience by completing your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                value={profileData.linkedinUrl}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                name="skills"
                value={profileData.skills}
                onChange={handleInputChange}
                placeholder="React, Node.js, Python, etc."
              />
            </div>

            {profileData.walletAddress && (
              <div className="space-y-2">
                <Label>Connected Wallet</Label>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-sm font-mono break-all">
                    {profileData.walletAddress}
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              Complete Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
