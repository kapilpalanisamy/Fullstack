import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  MapPin, 
  Linkedin, 
  Upload,
  Briefcase,
  GraduationCap,
  Star,
  Edit,
  Save,
  X,
  Phone,
  Globe,
  Github,
  Calendar,
  FileText
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useWallet } from "../contexts/WalletContext";
import WalletConnection from "../components/WalletConnection";

const ProfileManagement = () => {
  const { isConnected, walletAddress } = useWallet();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    location: user?.location || "",
    website: user?.website || "",
    linkedin_url: user?.linkedin_url || "",
    github_url: user?.github_url || "",
    avatar_url: user?.avatar_url || "",
    skills: user?.skills || "",
    experience_years: user?.experience_years || "",
    experience: user?.experience || "",
    education: user?.education || "",
    resume_url: user?.resume_url || ""
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
      // Upload the resume file
      const formData = new FormData();
      formData.append('resume', file);
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/upload-resume`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        if (data.success) {
          setProfileData(prev => ({
            ...prev,
            resume_url: data.url
          }));
          // After successful upload, extract skills
          await extractSkills(data.url);
        }
      } catch (error) {
        console.error('Error uploading resume:', error);
        alert('Failed to upload resume. Please try again.');
      }
    }
  };

  const extractSkills = async (resumeUrl) => {
    setIsExtracting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/extract-skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeUrl }),
      });
      
      const data = await response.json();
      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          skills: Array.isArray(prev.skills) 
            ? [...new Set([...prev.skills, ...data.skills])] 
            : data.skills
        }));
        alert('Skills extracted successfully!');
      }
    } catch (error) {
      console.error('Error extracting skills:', error);
      alert('Failed to extract skills. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Profile update attempt with user:', user);
      console.log('📋 User ID being sent:', user?.id, '(type:', typeof user?.id, ')');
      
      // Make API call to update profile
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          bio: profileData.bio,
          phone: profileData.phone,
          location: profileData.location,
          website: profileData.website,
          linkedin_url: profileData.linkedin_url,
          github_url: profileData.github_url,
          avatar_url: profileData.avatar_url,
          skills: profileData.skills,
          experience_years: parseInt(profileData.experience_years) || null,
          experience: profileData.experience,
          education: profileData.education,
          resume_url: profileData.resume_url,
        }),
      });

      const data = await response.json();
      console.log('📥 Profile update response:', data);

      if (data.success) {
        // Update the auth context with new user data
        if (updateUser) {
          updateUser(data.data);
        }
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      phone: user?.phone || "",
      location: user?.location || "",
      website: user?.website || "",
      linkedin_url: user?.linkedin_url || "",
      github_url: user?.github_url || "",
      avatar_url: user?.avatar_url || "",
      skills: user?.skills || "",
      experience_years: user?.experience_years || "",
      experience: user?.experience || "",
      education: user?.education || "",
      resume_url: user?.resume_url || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile Management</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit size={16} />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
              <Save size={16} />
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
              <X size={16} />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled={true} // Email should not be editable
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself, your experience, and what you're looking for..."
              value={profileData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              disabled={!isEditing}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone size={20} />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={profileData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State, Country"
                value={profileData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Online Presence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={20} />
            Online Presence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">Personal Website</Label>
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={profileData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
              <Input
                id="linkedin_url"
                placeholder="https://linkedin.com/in/username"
                value={profileData.linkedin_url}
                onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="github_url">GitHub Profile</Label>
              <Input
                id="github_url"
                placeholder="https://github.com/username"
                value={profileData.github_url}
                onChange={(e) => handleInputChange("github_url", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="avatar_url">Profile Picture URL</Label>
              <Input
                id="avatar_url"
                placeholder="https://example.com/avatar.jpg"
                value={profileData.avatar_url}
                onChange={(e) => handleInputChange("avatar_url", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Blockchain Wallet Integration */}
          <div className="mt-4">
            <Label>Blockchain Wallet</Label>
            {isConnected ? (
              <div className="mt-2">
                <Badge variant="secondary" className="text-sm font-mono">
                  {walletAddress}
                </Badge>
              </div>
            ) : (
              <div className="mt-2">
                <WalletConnection
                  onConnect={(address) => {
                    handleInputChange("wallet_address", address);
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase size={20} />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                type="number"
                placeholder="5"
                value={profileData.experience_years}
                onChange={(e) => handleInputChange("experience_years", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="resume_url">Resume URL</Label>
              <Input
                id="resume_url"
                placeholder="https://example.com/resume.pdf"
                value={profileData.resume_url}
                onChange={(e) => handleInputChange("resume_url", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <div className="flex gap-2">
              <Textarea
                id="skills"
                placeholder="JavaScript, React, Node.js, Python, SQL, Git..."
                value={profileData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                disabled={!isEditing}
                rows={3}
                className="flex-1"
              />
              {isEditing && (
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="w-full"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => extractSkills(profileData.resume_url)}
                    disabled={isExtracting || !profileData.resume_url}
                  >
                    {isExtracting ? "Extracting..." : "Extract Skills from Resume"}
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              List your technical skills separated by commas, or upload your resume for AI-powered skill extraction
            </p>
          </div>

          <div>
            <Label htmlFor="experience">Work Experience</Label>
            <Textarea
              id="experience"
              placeholder="Senior Developer at TechCorp (2020-2023) - Led development of web applications using React and Node.js..."
              value={profileData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              disabled={!isEditing}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">Describe your work experience, projects, and achievements</p>
          </div>

          <div>
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              placeholder="Bachelor's in Computer Science, University of Technology (2016-2020)"
              value={profileData.education}
              onChange={(e) => handleInputChange("education", e.target.value)}
              disabled={!isEditing}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">Include degrees, certifications, and relevant courses</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
