import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { X, Filter, Search, MapPin, DollarSign, Clock, Briefcase } from "lucide-react";
import { Slider } from "./ui/slider";

const JobFilters = ({ onFiltersChange, filters = {} }) => {
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || "",
    location: filters.location || "",
    jobType: filters.jobType || "",
    experience: filters.experience || "",
    salary: filters.salary || [0, 200000],
    company: filters.company || "",
    skills: filters.skills || [],
    remote: filters.remote || "",
    ...filters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const jobTypes = [
    "Full-time",
    "Part-time", 
    "Contract",
    "Freelance",
    "Internship",
    "Temporary"
  ];

  const experienceLevels = [
    "Entry Level",
    "Mid Level", 
    "Senior Level",
    "Executive",
    "Student"
  ];

  const remoteOptions = [
    "On-site",
    "Remote",
    "Hybrid"
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const addSkill = () => {
    if (skillInput.trim() && !localFilters.skills.includes(skillInput.trim())) {
      const newSkills = [...localFilters.skills, skillInput.trim()];
      handleFilterChange("skills", newSkills);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    const newSkills = localFilters.skills.filter(skill => skill !== skillToRemove);
    handleFilterChange("skills", newSkills);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: "",
      location: "",
      jobType: "",
      experience: "",
      salary: [0, 200000],
      company: "",
      skills: [],
      remote: ""
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0 && !(value.length === 2 && value[0] === 0 && value[1] === 200000);
    }
    return value !== "" && value !== null && value !== undefined;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={20} />
            Job Filters
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Simple" : "Advanced"}
            </Button>
            {hasActiveFilters && (
              <Button variant="destructive" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Location - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs, companies, skills..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Location (city, state, country)"
              value={localFilters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select value={localFilters.jobType} onValueChange={(value) => handleFilterChange("jobType", value)}>
            <SelectTrigger>
              <Briefcase className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              {jobTypes.map((type) => (
                <SelectItem key={type} value={type.toLowerCase().replace(" ", "-")}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={localFilters.experience} onValueChange={(value) => handleFilterChange("experience", value)}>
            <SelectTrigger>
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map((level) => (
                <SelectItem key={level} value={level.toLowerCase().replace(" ", "-")}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={localFilters.remote} onValueChange={(value) => handleFilterChange("remote", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Work Type" />
            </SelectTrigger>
            <SelectContent>
              {remoteOptions.map((option) => (
                <SelectItem key={option} value={option.toLowerCase()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 border-t pt-4">
            {/* Salary Range */}
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign size={16} />
                Salary Range: ${localFilters.salary[0].toLocaleString()} - ${localFilters.salary[1].toLocaleString()}
              </label>
              <Slider
                value={localFilters.salary}
                onValueChange={(value) => handleFilterChange("salary", value)}
                max={200000}
                min={0}
                step={5000}
                className="mt-2"
              />
            </div>

            {/* Company */}
            <Input
              placeholder="Company name"
              value={localFilters.company}
              onChange={(e) => handleFilterChange("company", e.target.value)}
            />

            {/* Skills */}
            <div>
              <label className="text-sm font-medium mb-2 block">Skills</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add skill (e.g., React, Python)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                />
                <Button onClick={addSkill} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {localFilters.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobFilters;
