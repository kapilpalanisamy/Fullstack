import { useAuth } from "../contexts/AuthContext";
import { useJobs } from "../contexts/JobsContext";
import ApplicationCard from "./application-card";

const CreatedApplications = () => {
  const { user } = useAuth();
  const { applications } = useJobs();

  const userApplications = applications.filter(app => app.user_id === user?.id);

  return (
    <div className="flex flex-col gap-2">
      {userApplications?.length ? (
        userApplications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            isCandidate={true}
          />
        ))
      ) : (
        <div className="text-center py-8">
          <h3 className="text-2xl font-semibold mb-4">No Applications Yet</h3>
          <p className="text-gray-600">You haven't applied to any jobs yet.</p>
        </div>
      )}
    </div>
  );
};

export default CreatedApplications;
