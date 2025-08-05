import { useAuth } from "../contexts/AuthContext";
import { useJobs } from "../contexts/JobsContext";
import JobCard from "./job-card";

const CreatedJobs = () => {
  const { user } = useAuth();
  const { userJobs } = useJobs();

  const myJobs = userJobs.filter(job => job.recruiter_id === user?.id);

  return (
    <div>
      {myJobs?.length ? (
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onJobAction={() => window.location.reload()}
              isMyJob={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold mb-4">No Jobs Posted</h3>
          <p className="text-gray-600 mb-6">You haven't posted any jobs yet.</p>
          <a 
            href="/post-job" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Post Your First Job
          </a>
        </div>
      )}
    </div>
  );
};

export default CreatedJobs;
