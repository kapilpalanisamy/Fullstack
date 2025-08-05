import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useJobs } from "../contexts/JobsContext";
import { Briefcase, MapPinIcon, DollarSign, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplyJobDrawer } from "@/components/apply-job";

const JobPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { jobs, savedJobs, saveJob, unsaveJob } = useJobs();
  const [showApplyDrawer, setShowApplyDrawer] = useState(false);

  const job = jobs.find(j => j.id === parseInt(id));
  const isSaved = savedJobs.includes(parseInt(id));
  const isRecruiter = user?.role === "recruiter";
  const isMyJob = job && job.recruiter_id === user?.id;

  if (!job) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">Job Not Found</h2>
        <p className="text-gray-600">The job you're looking for doesn't exist.</p>
        <Button onClick={() => window.history.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleSaveJob = () => {
    if (isSaved) {
      unsaveJob(job.id);
    } else {
      saveJob(job.id);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-8">
        {/* Job Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {job.company?.logo_url && (
                  <img 
                    src={job.company.logo_url} 
                    alt={job.company.name} 
                    className="h-16 w-16 object-contain rounded"
                  />
                )}
                <div>
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {job.company?.name}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isRecruiter && !isMyJob && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleSaveJob}
                    >
                      {isSaved ? "Unsave" : "Save Job"}
                    </Button>
                    <Button
                      onClick={() => setShowApplyDrawer(true)}
                      disabled={!user}
                    >
                      Apply Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPinIcon size={16} />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {job.type || "Full-time"}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign size={16} />
                {formatSalary(job.salary_min, job.salary_max)}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase size={16} />
                Posted {new Date(job.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company Info */}
            {job.company && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.company.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {job.company.logo_url && (
                      <img 
                        src={job.company.logo_url} 
                        alt={job.company.name} 
                        className="h-12 w-12 object-contain rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold">{job.company.name}</h4>
                      <p className="text-sm text-gray-600">Technology Company</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Apply Job Drawer */}
      <ApplyJobDrawer
        job={job}
        user={user}
        applied={false} // You can track this in context if needed
        open={showApplyDrawer}
        onOpenChange={setShowApplyDrawer}
      />
    </div>
  );
};

export default JobPage;
