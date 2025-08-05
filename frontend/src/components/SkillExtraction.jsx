import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { useAuth } from "../contexts/AuthContext";
import { Upload, FileText, Brain, CheckCircle, X, Plus, Save } from "lucide-react";

const SkillExtraction = () => {
  const { user, updateUser } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Predefined skill categories and keywords for better extraction
  const skillCategories = {
    "Programming Languages": [
      "javascript", "python", "java", "c++", "c#", "php", "ruby", "go", "rust", "kotlin",
      "swift", "typescript", "scala", "r", "matlab", "perl", "shell", "bash"
    ],
    "Web Technologies": [
      "html", "css", "react", "angular", "vue", "node.js", "express", "django", "flask",
      "laravel", "spring", "asp.net", "jquery", "bootstrap", "tailwind", "sass", "webpack"
    ],
    "Databases": [
      "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "sql server",
      "cassandra", "elasticsearch", "firebase", "dynamodb"
    ],
    "Cloud & DevOps": [
      "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform", "ansible",
      "git", "github", "gitlab", "ci/cd", "linux", "unix", "nginx", "apache"
    ],
    "Data Science & AI": [
      "machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy",
      "scikit-learn", "nlp", "computer vision", "data analysis", "statistics", "excel"
    ],
    "Mobile Development": [
      "android", "ios", "react native", "flutter", "xamarin", "cordova", "ionic"
    ],
    "Project Management": [
      "agile", "scrum", "kanban", "jira", "trello", "project management", "leadership",
      "team management", "communication", "problem solving"
    ]
  };

  // Simple NLP-based skill extraction
  const extractSkillsFromText = (text) => {
    const lowerText = text.toLowerCase();
    const extractedSkills = [];
    
    // Extract skills from each category
    Object.entries(skillCategories).forEach(([category, skills]) => {
      skills.forEach(skill => {
        // Look for exact matches and variations
        const skillVariations = [
          skill,
          skill.replace(/\./g, ''),
          skill.replace(/\s+/g, ''),
          skill.replace(/-/g, ' ')
        ];
        
        skillVariations.forEach(variation => {
          if (lowerText.includes(variation.toLowerCase())) {
            const skillObj = {
              name: skill,
              category,
              confidence: calculateConfidence(lowerText, variation),
              original: skill
            };
            
            // Avoid duplicates
            if (!extractedSkills.find(s => s.name.toLowerCase() === skill.toLowerCase())) {
              extractedSkills.push(skillObj);
            }
          }
        });
      });
    });
    
    // Sort by confidence
    return extractedSkills.sort((a, b) => b.confidence - a.confidence);
  };

  const calculateConfidence = (text, skill) => {
    const skillRegex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'gi');
    const matches = text.match(skillRegex) || [];
    const frequency = matches.length;
    
    // Base confidence on frequency and context
    let confidence = Math.min(frequency * 20 + 60, 95);
    
    // Boost confidence for skills mentioned in context of experience
    const contextWords = ['experience', 'proficient', 'expert', 'skilled', 'years', 'developed', 'built', 'created'];
    contextWords.forEach(word => {
      if (text.includes(word + ' ' + skill.toLowerCase()) || 
          text.includes(skill.toLowerCase() + ' ' + word)) {
        confidence = Math.min(confidence + 10, 98);
      }
    });
    
    return confidence;
  };

  const handleExtractSkills = async () => {
    if (!resumeText.trim()) return;
    
    setIsExtracting(true);
    setExtractedSkills([]);
    
    // Simulate AI processing with realistic delay
    setTimeout(() => {
      const skills = extractSkillsFromText(resumeText);
      setExtractedSkills(skills);
      setIsExtracting(false);
      setExtractionComplete(true);
    }, 3000);
  };

  const handleAddSkill = async (skill) => {
    if (!user) return;
    
    try {
      // Add skill to extracted skills list first for immediate UI feedback
      const currentUserSkills = user.skills ? user.skills.split(',').map(s => s.trim()) : [];
      const skillName = skill.name;
      
      if (!currentUserSkills.includes(skillName)) {
        const updatedSkills = [...currentUserSkills, skillName].join(', ');
        
        // Update backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            skills: updatedSkills
          }),
        });

        if (response.ok) {
          updateUser({ skills: updatedSkills });
          alert(`Skill "${skillName}" added to your profile!`);
        } else {
          alert('Failed to update your profile. Please try again.');
        }
      } else {
        alert(`You already have "${skillName}" in your profile.`);
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Failed to add skill. Please try again.');
    }
  };

  const handleSaveAllSkills = async () => {
    if (!user || extractedSkills.length === 0) return;
    
    setIsSaving(true);
    try {
      const currentUserSkills = user.skills ? user.skills.split(',').map(s => s.trim()) : [];
      const newSkills = extractedSkills.map(skill => skill.name);
      const allSkills = [...new Set([...currentUserSkills, ...newSkills])];
      const updatedSkills = allSkills.join(', ');
      
      // Update backend
      const response = await fetch(`http://localhost:5000/api/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: updatedSkills
        }),
      });

      if (response.ok) {
        updateUser({ skills: updatedSkills });
        alert(`${newSkills.length} skills added to your profile!`);
        setExtractedSkills([]);
        setExtractionComplete(false);
      } else {
        alert('Failed to update your profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving skills:', error);
      alert('Failed to save skills. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveExtractedSkill = (skillToRemove) => {
    setExtractedSkills(extractedSkills.filter(skill => skill.name !== skillToRemove.name));
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "text-green-600 bg-green-100";
    if (confidence >= 60) return "text-blue-600 bg-blue-100";
    if (confidence >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const groupSkillsByCategory = (skills) => {
    const grouped = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            AI Skill Extraction
          </CardTitle>
          <CardDescription>
            Paste your resume or bio to automatically extract your skills using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Resume or Bio Text
            </label>
            <Textarea
              placeholder="Paste your resume content or professional bio here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleExtractSkills}
              disabled={!resumeText.trim() || isExtracting}
              className="flex items-center gap-2"
            >
              {isExtracting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Extracting...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Extract Skills
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={() => {
              setResumeText("");
              setExtractedSkills([]);
              setExtractionComplete(false);
            }}>
              Clear
            </Button>
          </div>
          
          {isExtracting && (
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm font-medium">AI is analyzing your text...</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Identifying skills, technologies, and competencies
                  </p>
                  <Progress value={33} className="mt-4" />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {extractionComplete && extractedSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Extracted Skills ({extractedSkills.length})
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSaveAllSkills}
                disabled={isSaving || extractedSkills.length === 0}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Brain className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save All to Profile
                  </>
                )}
              </Button>
            </CardTitle>
            <CardDescription>
              Review and add skills to your profile. Confidence scores indicate extraction accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupSkillsByCategory(extractedSkills)).map(([category, skills]) => (
                <div key={category}>
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">{category}</h3>
                  <div className="grid gap-3">
                    {skills.map((skill, index) => {
                      const isAlreadyAdded = user.skills?.includes(skill.name);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge className={getConfidenceColor(skill.confidence)}>
                              {skill.confidence}%
                            </Badge>
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isAlreadyAdded ? (
                              <Badge variant="secondary" className="text-green-600 bg-green-100">
                                <CheckCircle size={12} className="mr-1" />
                                Added
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddSkill(skill)}
                                className="flex items-center gap-1"
                              >
                                <Plus size={14} />
                                Add
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveExtractedSkill(skill)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {extractionComplete && extractedSkills.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Skills Detected</h3>
              <p className="text-gray-600 mb-4">
                Try adding more detailed information about your technical skills and experience
              </p>
              <Button variant="outline" onClick={() => setExtractionComplete(false)}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Profile Skills */}
      {user.skills && user.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Profile Skills</CardTitle>
            <CardDescription>
              Skills currently in your profile ({user.skills.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillExtraction;
