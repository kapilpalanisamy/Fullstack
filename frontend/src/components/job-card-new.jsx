/* eslint-disable react/prop-types */
import { Heart, MapPinIcon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
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
  const { saveJob, unsaveJob } = useJobs();

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

  return (
    <Card className="flex flex-col">
      {/* Loading indicator can be added here if needed */}
      <CardHeader className="flex">
        <CardTitle className="flex justify-between font-bold">
          {job.title}
          {isMyJob && (
            <Trash2Icon
              fill="red"
              size={18}
              className="text-red-300 cursor-pointer"
              onClick={handleDeleteJob}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex justify-between">
          {job.company && job.company.logo_url && (
            <img src={job.company.logo_url} className="h-6" alt={job.company.name} />
          )}
          <div className="flex gap-2 items-center">
            <MapPinIcon size={15} /> {job.location}
          </div>
        </div>
        <hr />
        <div className="truncate-multiline">
          {job.description.substring(0, 150)}...
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link to={`/job/${job.id}`}>
          <Button variant="secondary" size="sm">
            More Details
          </Button>
        </Link>
        {!isMyJob && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveJob}
            disabled={!user}
          >
            {saved ? (
              <Heart size={20} stroke="red" fill="red" />
            ) : (
              <Heart size={20} />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
