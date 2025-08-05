import CreatedApplications from "@/components/created-applications";
import CreatedJobs from "@/components/created-jobs";
import { useAuth } from "../contexts/AuthContext";

const MyJobs = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">
        {user?.role === "candidate" ? "My Applications" : "My Jobs"}
      </h1>
      {user?.role === "candidate" ? (
        <CreatedApplications />
      ) : (
        <CreatedJobs />
      )}
    </div>
  );
};

export default MyJobs;
