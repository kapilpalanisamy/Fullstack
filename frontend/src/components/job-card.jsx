/* eslint-disable react/prop-types */
import { Heart, MapPinIcon, Trash2Icon, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useJobs } from "../contexts/JobsContext";
import { useEffect, useState } from "react";

const JobCard = ({
  job,
  savedInit = false,
  onJobAction = () => {},
  isMyJob = false,
}) => {
  const [saved, setSaved] = useState(savedInit);

  const { user } = useAuth();
  const { saveJob, unsaveJob, isDeadlinePassed, applications } = useJobs();

  useEffect(() => {
    setSaved(savedInit);
  }, [savedInit]);

  const handleSaveJob = async () => {
    if (saved) {
      unsaveJob(job.id);
      setSaved(false);
    } else {
      saveJob(job.id);
      setSaved(true);
    }
    onJobAction();
  };

  const handleDeleteJob = async () => {
    // For now, just remove from UI - in full implementation would call API
    onJobAction();
  };

  // Check if deadline has passed
  const deadlinePassed = job.application_deadline ? 
    new Date(job.application_deadline) < new Date() : false;
  
  // Check if user has already applied
  const hasApplied = applications?.some(app => 
    app.job_id === job.id && app.candidate_id === user?.id
  );

  // Get user's application status if exists
  const userApplication = applications?.find(app => 
    app.job_id === job.id && app.candidate_id === user?.id
  );

  const canApply = user?.role !== "recruiter" && !deadlinePassed && !hasApplied;

  return (
    <Card className="flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
      {/* Loading indicator can be added here if needed */}
      <CardHeader className="flex pb-3">
        <CardTitle className="flex justify-between font-bold text-base sm:text-lg">
          <span className="truncate pr-2">{job.title || 'Untitled Job'}</span>
          {isMyJob && (
            <Trash2Icon
              fill="red"
              size={18}
              className="text-red-300 cursor-pointer hover:text-red-500 transition-colors flex-shrink-0"
              onClick={handleDeleteJob}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {(job.company || job.company_name) && (
            <div className="flex items-center">
              {job.company?.logo_url && (
                <img src={job.company.logo_url} className="h-5 sm:h-6" alt={job.company.name || job.company_name || 'Company'} />
              )}
              <span className="ml-2 text-sm font-medium">{job.company?.name || job.company_name || 'Unknown Company'}</span>
            </div>
          )}
          <div className="flex gap-2 items-center text-sm text-gray-500">
            <MapPinIcon size={14} /> 
            <span className="truncate">{job.location || 'Location not specified'}</span>
          </div>
        </div>
        <hr className="border-gray-700" />
        <div className="text-sm sm:text-base text-gray-300 line-clamp-3">
          {job.description ? (typeof job.description === 'string' ? job.description.substring(0, 150) : String(job.description).substring(0, 150)) : 'No description available'}...
        </div>
        
        {/* Deadline and Status Information */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          {job.application_deadline && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              deadlinePassed ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <Calendar size={12} />
              <span>
                {deadlinePassed ? 'Expired' : `Deadline: ${job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'Not specified'}`}
              </span>
            </div>
          )}
          
          {hasApplied && (
            <Badge variant="outline" className="text-xs">
              Applied - {userApplication?.status}
            </Badge>
          )}
          
          {deadlinePassed && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle size={12} className="mr-1" />
              Applications Closed
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 px-4 sm:px-6 pt-3">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Link to={`/job/${job.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              More Details
            </Button>
          </Link>
          
          {canApply && (
            <Link to={`/job/${job.id}`} className="flex-1">
              <Button size="sm" className="w-full">
                Apply Now
              </Button>
            </Link>
          )}
          
          {!isMyJob && !canApply && !hasApplied && user?.role !== "recruiter" && (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex-1"
            >
              {deadlinePassed ? 'Applications Closed' : 'Cannot Apply'}
            </Button>
          )}
          
          {!isMyJob && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveJob}
              disabled={!user}
              className="flex-shrink-0"
            >
              {saved ? (
                <Heart size={18} stroke="red" fill="red" />
              ) : (
                <Heart size={18} />
              )}
            </Button>
          )}
        </div>
        
        {/* Status Messages */}
        {hasApplied && userApplication && (
          <div className="w-full text-center">
            <Badge 
              variant={userApplication.status === 'hired' ? 'default' : 'secondary'}
              className="text-xs"
            >
              Status: {userApplication.status}
            </Badge>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
