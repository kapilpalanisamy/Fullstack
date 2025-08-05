import apiService from "@/services/apiService";

// - Apply to job ( candidate ) - placeholder until backend implements applications
export async function applyToJob(token, _, jobData) {
  // TODO: Implement when backend has applications endpoint with file upload
  console.warn("applyToJob: Backend endpoint not implemented yet");
  
  // Mock successful application for now
  return {
    success: true,
    data: {
      id: Math.random().toString(),
      job_id: jobData.job_id,
      candidate_id: jobData.candidate_id,
      status: 'pending',
      applied_at: new Date().toISOString()
    }
  };
}

// - Edit Application Status ( recruiter ) - placeholder until backend implements applications
export async function updateApplicationStatus(token, { job_id }, status) {
  // TODO: Implement when backend has applications endpoint
  console.warn("updateApplicationStatus: Backend endpoint not implemented yet");
  
  // Mock successful status update for now
  return {
    success: true,
    data: {
      job_id: job_id,
      status: status,
      updated_at: new Date().toISOString()
    }
  };
}

// Get applications - placeholder until backend implements applications
export async function getApplications(token, { user_id }) {
  // TODO: Implement when backend has applications endpoint
  console.warn("getApplications: Backend endpoint not implemented yet");
  
  // Return empty applications for now
  return [];
}
