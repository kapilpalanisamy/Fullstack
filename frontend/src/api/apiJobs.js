import apiService from "@/services/apiService";

// Fetch Jobs
export async function getJobs(token, { location, company_id, searchQuery, job_type, experience_level }) {
  try {
    const filters = {};
    if (location) filters.location = location;
    if (job_type) filters.job_type = job_type;
    if (experience_level) filters.experience_level = experience_level;
    if (searchQuery) filters.searchQuery = searchQuery;
    
    const response = await apiService.getJobs(filters);
    
    if (!response.success) {
      console.error("Error fetching Jobs:", response.message);
      return null;
    }

    // Transform data to match expected frontend format
    const transformedJobs = response.jobs.map(job => ({
      ...job,
      // Map backend fields to frontend expectations
      deadline: job.application_deadline,
      currency: job.salary_currency,
      recruiter_id: job.created_by,
      isOpen: job.is_active,
      // Keep company data structure if it exists
      company: job.company_name ? {
        name: job.company_name,
        logo_url: job.company_logo
      } : null,
      // Mock saved jobs array for compatibility (will be updated when implementing saved jobs)
      saved: []
    }));

    return transformedJobs;
  } catch (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }
}

// Read Saved Jobs (placeholder - will need backend endpoint)
export async function getSavedJobs(token) {
  // TODO: Implement when backend has saved jobs endpoint
  console.warn("getSavedJobs: Backend endpoint not implemented yet");
  return [];
}

// - Add / Remove Saved Job (placeholder - will need backend endpoint)
export async function saveJob(token, { alreadySaved }, saveData) {
  // TODO: Implement when backend has saved jobs endpoint
  console.warn("saveJob: Backend endpoint not implemented yet");
  return { success: true, data: null };
}

// - job isOpen toggle (placeholder - will need backend endpoint)
export async function updateHiringStatus(token, { job_id }, isOpen) {
  // TODO: Implement when backend has job update endpoint
  console.warn("updateHiringStatus: Backend endpoint not implemented yet");
  return null;
}

// get my created jobs (placeholder - will need backend endpoint with user filtering)
export async function getMyJobs(token, { recruiter_id }) {
  try {
    // For now, get all jobs and filter by recruiter_id on frontend
    // TODO: Add backend endpoint that filters by user
    const response = await apiService.getJobs();
    
    if (!response.success) {
      console.error("Error fetching Jobs:", response.message);
      return null;
    }

    // Filter jobs by recruiter_id (created_by in backend)
    const myJobs = response.jobs.filter(job => job.created_by === recruiter_id);
    
    // Transform data to match expected frontend format
    const transformedJobs = myJobs.map(job => ({
      ...job,
      deadline: job.application_deadline,
      currency: job.salary_currency,
      recruiter_id: job.created_by,
      isOpen: job.is_active,
      company: job.company_name ? {
        name: job.company_name,
        logo_url: job.company_logo
      } : null
    }));

    return transformedJobs;
  } catch (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }
}

// Delete job (placeholder - will need backend endpoint)
export async function deleteJob(token, { job_id }) {
  // TODO: Implement when backend has delete job endpoint
  console.warn("deleteJob: Backend endpoint not implemented yet");
  return { success: true, data: null };
}

// - post job (placeholder - will need backend endpoint)
export async function addNewJob(token, _, jobData) {
  try {
    // Transform frontend data to backend format
    const backendJobData = {
      ...jobData,
      // Map frontend fields to backend expectations
      application_deadline: jobData.deadline,
      salary_currency: jobData.currency,
      created_by: jobData.recruiter_id,
      is_active: jobData.isOpen !== undefined ? jobData.isOpen : true,
      is_featured: jobData.is_featured || false
    };

    const response = await apiService.createJob(backendJobData);
    return response.data;
  } catch (error) {
    console.error("Error creating job:", error);
    throw new Error("Error Creating Job");
  }
}
