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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Wallet, DollarSign } from "lucide-react";
import { State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useJobs } from "../contexts/JobsContext";
import { useWallet } from "../contexts/WalletContext";
import AddCompanyDrawer from "@/components/add-company-drawer";
import WalletConnection from "@/components/WalletConnection";
import PaymentComponent from "@/components/PaymentComponent";

const EnhancedPostJob = () => {
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
         experience_level: "mid",
    required_skills: "",
    application_deadline: "",
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
    // Clear error when user selects
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Job title is required";
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
      
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Job Details</span>
          </div>
          <div className="h-px w-12 bg-gray-300"></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Payment</span>
          </div>
          <div className="h-px w-12 bg-gray-300"></div>
          <div className={`flex items-center ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'}`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Complete</span>
          </div>
        </div>
      </div>

      {/* Step 1: Job Details Form */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Job Details
            </CardTitle>
            <p className="text-gray-600">
              Fill in the information below to post your job listing
            </p>
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
                         <SelectItem value="entry">Entry Level</SelectItem>
                         <SelectItem value="mid">Mid Level</SelectItem>
                         <SelectItem value="senior">Senior Level</SelectItem>
                         <SelectItem value="executive">Executive</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="List the required skills, experience, and qualifications..."
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
                  placeholder="React, Node.js, TypeScript, AWS..."
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
                  <div className="flex items-center justify-between">
                    <Label>Company *</Label>
                    <AddCompanyDrawer />
                  </div>
                  <Select value={formData.company_id} onValueChange={(value) => handleSelectChange("company_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.company_id && <p className="text-red-500 text-sm">{errors.company_id}</p>}
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
                    placeholder="50000"
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
                    placeholder="100000"
                  />
                </div>
              </div>

              {paymentCompleted && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle size={16} className="text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Payment Completed!</strong> Transaction: {transactionHash?.slice(0, 10)}...
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Posting Job..." : paymentCompleted ? "🚀 Post Job Now" : "Continue to Payment →"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Payment */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet size={20} />
                Blockchain Payment Required
              </CardTitle>
              <p className="text-gray-600">
                Connect your wallet and pay the platform fee to post your job
              </p>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Connection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">1. Connect Wallet</h3>
              <WalletConnection />
            </div>
            
            {/* Payment */}
            <div>
              <h3 className="text-lg font-semibold mb-4">2. Pay Platform Fee</h3>
              {isConnected ? (
                <PaymentComponent onPaymentSuccess={handlePaymentSuccess} />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Connect your wallet first to proceed with payment</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              ← Back to Form
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-600 text-2xl">
              🎉 Job Posted Successfully!
            </CardTitle>
            <p className="text-center text-gray-600">
              Your job listing is now live and visible to candidates
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
              <h3 className="font-bold text-xl mb-2">{formData.title}</h3>
              <p className="text-gray-700 mb-2">
                {formData.company_id && companies.find(c => c.id.toString() === formData.company_id)?.name}
              </p>
              <div className="flex justify-center gap-4 mb-4">
                <Badge variant="secondary">{formData.type}</Badge>
                <Badge variant="outline">{formData.location}</Badge>
              </div>
              <p className="text-sm text-green-600 font-mono">
                Payment confirmed: {transactionHash?.slice(0, 20)}...
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">Redirecting to jobs page in 3 seconds...</p>
              <Button onClick={() => navigate("/jobs")} className="w-full max-w-sm">
                View All Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedPostJob;
