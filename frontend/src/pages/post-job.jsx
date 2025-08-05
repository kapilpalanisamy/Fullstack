import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useJobs } from "../contexts/JobsContext";
import { useWallet } from "../contexts/WalletContext";
import AddCompanyDrawer from "@/components/add-company-drawer";
import WalletConnection from "@/components/WalletConnection";
import PaymentComponent from "@/components/PaymentComponent";

const PostJob = () => {
  const { user } = useAuth();
  const { companies, postJob } = useJobs();
  const { isConnected } = useWallet();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    company_id: "",
    requirements: "",
    salary_min: "",
    salary_max: "",
    job_type: "full-time",
    experience_level: "MID",
    required_skills: "",
    application_deadline: "", // New field for application deadline
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Payment, 3: Confirmation

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.company_id) newErrors.company_id = "Company is required";
    if (!formData.requirements.trim()) newErrors.requirements = "Requirements are required";
    if (!formData.application_deadline) newErrors.application_deadline = "Application deadline is required";
    
    // Validate deadline is in the future
    if (formData.application_deadline) {
      const deadline = new Date(formData.application_deadline);
      const now = new Date();
      if (deadline <= now) {
        newErrors.application_deadline = "Deadline must be in the future";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // If payment not completed, move to payment step
    if (!paymentCompleted) {
      setCurrentStep(2);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const selectedCompany = companies.find(c => c.id.toString() === formData.company_id);
      
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        company_id: formData.company_id,
        requirements: formData.requirements,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        required_skills: formData.required_skills.split(",").map(skill => skill.trim()).filter(skill => skill),
        application_deadline: new Date(formData.application_deadline).toISOString(),
        created_by: user.id,
        transaction_hash: transactionHash, // Store payment proof
        payment_confirmed: true,
      };
      
      postJob(jobData);
      setCurrentStep(3);
      
      // Redirect after success
      setTimeout(() => {
        navigate("/jobs");
      }, 3000);
    } catch (error) {
      console.error("Error posting job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (txHash) => {
    setPaymentCompleted(true);
    setTransactionHash(txHash);
    setCurrentStep(1); // Go back to form for final submission
  };

  if (user?.role !== "recruiter") {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p className="text-gray-600">Only employers can post jobs.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">
        Post a Job
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Fill in the information below to post your job listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Frontend Developer"
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type</Label>
                <Select value={formData.job_type} onValueChange={(value) => handleSelectChange("job_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select value={formData.experience_level} onValueChange={(value) => handleSelectChange("experience_level", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ENTRY">Entry Level</SelectItem>
                      <SelectItem value="JUNIOR">Junior Level</SelectItem>
                      <SelectItem value="MID">Mid Level</SelectItem>
                      <SelectItem value="SENIOR">Senior Level</SelectItem>
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="EXECUTIVE">Executive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={5}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={formData.location} onValueChange={(value) => handleSelectChange("location", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="New York, NY">New York, NY</SelectItem>
                      <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                      <SelectItem value="Los Angeles, CA">Los Angeles, CA</SelectItem>
                      <SelectItem value="Chicago, IL">Chicago, IL</SelectItem>
                      <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                      <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
                      <SelectItem value="Boston, MA">Boston, MA</SelectItem>
                      <SelectItem value="Denver, CO">Denver, CO</SelectItem>
                      <SelectItem value="Atlanta, GA">Atlanta, GA</SelectItem>
                      <SelectItem value="Miami, FL">Miami, FL</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="London, UK">London, UK</SelectItem>
                      <SelectItem value="Toronto, Canada">Toronto, Canada</SelectItem>
                      <SelectItem value="Berlin, Germany">Berlin, Germany</SelectItem>
                      <SelectItem value="Amsterdam, Netherlands">Amsterdam, Netherlands</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                      <SelectItem value="Sydney, Australia">Sydney, Australia</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id">Company *</Label>
                <div className="flex gap-2">
                  <Select value={formData.company_id} onValueChange={(value) => handleSelectChange("company_id", value)} className="flex-1">
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {companies.map(({ name, id }) => (
                          <SelectItem key={id} value={id.toString()}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <AddCompanyDrawer onCompanyAdded={() => {
                    // Company list will be automatically updated by context
                  }} />
                </div>
                {errors.company_id && <p className="text-red-500 text-sm">{errors.company_id}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="List the key requirements, qualifications, and experience needed..."
                rows={4}
              />
              {errors.requirements && <p className="text-red-500 text-sm">{errors.requirements}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="required_skills">Skills (comma-separated)</Label>
              <Input
                id="required_skills"
                name="required_skills"
                value={formData.required_skills}
                onChange={handleInputChange}
                placeholder="React, Node.js, TypeScript, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="application_deadline">Application Deadline *</Label>
                <Input
                  id="application_deadline"
                  name="application_deadline"
                  type="datetime-local"
                  value={formData.application_deadline}
                  onChange={handleInputChange}
                  required
                />
                {errors.application_deadline && <p className="text-red-500 text-sm">{errors.application_deadline}</p>}
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Minimum Salary ($)</Label>
                  <Input
                    id="salary_min"
                    name="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={handleInputChange}
                    placeholder="80000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_max">Maximum Salary ($)</Label>
                  <Input
                    id="salary_max"
                    name="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={handleInputChange}
                    placeholder="120000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-sm text-gray-500">
                  Set a deadline for applications. After this date, candidates won't be able to apply.
                </p>
              </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting Job..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
