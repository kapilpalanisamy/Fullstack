import JobCard from "@/components/job-card";
import { useJobs } from "../contexts/JobsContext";

const SavedJobs = () => {
  const { jobs, savedJobs } = useJobs();

  const savedJobsList = jobs.filter(job => savedJobs.includes(job.id));

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-6xl sm:text-7xl text-center pb-8">
        Saved Jobs
      </h1>

      {savedJobsList?.length ? (
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedJobsList.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              savedInit={true}
              onJobAction={() => window.location.reload()} // Simple refresh for now
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold mb-4">No Saved Jobs</h3>
          <p className="text-gray-600 mb-6">You haven't saved any jobs yet.</p>
          <a 
            href="/jobs" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Jobs
          </a>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
