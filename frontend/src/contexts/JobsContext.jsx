import { createContext, useContext, useState, useEffect } from "react";

const JobsContext = createContext();

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return context;
};

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [userJobs, setUserJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

  // Helper function for API calls
  const apiCall = async (endpoint, options = {}) => {
    try {
      // Get user token from localStorage
      const storedUser = localStorage.getItem("jobPortalUser");
      const userToken = storedUser ? JSON.parse(storedUser).token : null;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(userToken && { 'Authorization': `Bearer ${userToken}` }),
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Load data from backend on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load jobs, companies, and applications from backend
      await Promise.all([
        fetchJobs(),
        fetchCompanies(),
        fetchApplications()
      ]);
      
      // Load saved data from localStorage (as cache only)
      const savedJobsData = localStorage.getItem("savedJobs");
      if (savedJobsData) {
        setSavedJobs(JSON.parse(savedJobsData));
      }
      
      const userJobsData = localStorage.getItem("userJobs");
      if (userJobsData) {
        setUserJobs(JSON.parse(userJobsData));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load data from backend');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async (filters = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/jobs?${queryParams}` : '/jobs';
      const response = await apiCall(endpoint);
      
      if (response.success) {
        setJobs(response.data || []);
        return response.data || [];
      } else {
        setError('Failed to fetch jobs');
        return [];
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to connect to backend for jobs');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await apiCall('/companies');
      if (response.success) {
        setCompanies(response.data || []);
        return response.data || [];
      } else {
        setError('Failed to fetch companies');
        return [];
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to connect to backend for companies');
      return [];
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await apiCall('/applications');
      if (response.success) {
        setApplications(response.data || []);
        return response.data || [];
      } else {
        setError('Failed to fetch applications');
        return [];
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to connect to backend for applications');
      return [];
    }
  };

  const createJob = async (jobData) => {
    try {
      setLoading(true);
      const response = await apiCall('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData)
      });
      
      if (response.success) {
        // Refresh jobs list
        await fetchJobs();
        return { success: true, job: response.data };
      } else {
        setError('Failed to create job');
        return { success: false, error: response.message || 'Failed to create job' };
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to connect to backend for job creation');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData) => {
    try {
      setLoading(true);
      const response = await apiCall('/companies', {
        method: 'POST',
        body: JSON.stringify(companyData)
      });
      
      if (response.success) {
        // Refresh companies list
        await fetchCompanies();
        return { success: true, company: response.data };
      } else {
        setError('Failed to create company');
        return { success: false, error: response.message || 'Failed to create company' };
      }
    } catch (error) {
      console.error('Error creating company:', error);
      setError('Failed to connect to backend for company creation');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Applications - Backend API integration
  const applyToJob = async (jobId, applicationData) => {
    try {
      setLoading(true);
      console.log('Apply to job - jobId:', jobId);
      console.log('Apply to job - applicationData:', applicationData);
      const requestBody = {
        job_id: jobId,
        ...applicationData
      };
      console.log('Apply to job - requestBody:', requestBody);
      
      const response = await apiCall('/applications', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      if (response.success) {
        // Refresh applications
        const newApplication = response.data;
        setApplications(prev => [newApplication, ...prev]);
        return { success: true, application: newApplication };
      } else {
        setError('Failed to submit application');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      setError('Failed to connect to backend for application');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus, feedback = null) => {
    try {
      const response = await apiCall(`/applications/${applicationId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          feedback: feedback
        })
      });
      
      if (response.success) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus, feedback: feedback }
              : app
          )
        );
        return { success: true };
      } else {
        setError('Failed to update application');
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('Error updating application:', error);
      return { success: false, error: error.message };
    }
  };

  // Local storage operations for saved jobs (cache only)
  const saveJob = async (jobId) => {
    try {
      // Call backend API to save job
      const response = await apiCall('/user/saved-jobs', {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId })
      });
      
      if (response.success) {
        const newSavedJobs = [...savedJobs, jobId];
        setSavedJobs(newSavedJobs);
        localStorage.setItem("savedJobs", JSON.stringify(newSavedJobs));
        return { success: true };
      } else {
        // Fallback to localStorage only
        const newSavedJobs = [...savedJobs, jobId];
        setSavedJobs(newSavedJobs);
        localStorage.setItem("savedJobs", JSON.stringify(newSavedJobs));
        return { success: true };
      }
    } catch (error) {
      console.error('Error saving job:', error);
      // Fallback to localStorage
      const newSavedJobs = [...savedJobs, jobId];
      setSavedJobs(newSavedJobs);
      localStorage.setItem("savedJobs", JSON.stringify(newSavedJobs));
      return { success: true };
    }
  };

  const unsaveJob = async (jobId) => {
    try {
      // Call backend API to unsave job
      const response = await apiCall(`/user/saved-jobs/${jobId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        const newSavedJobs = savedJobs.filter(id => id !== jobId);
        setSavedJobs(newSavedJobs);
        localStorage.setItem("savedJobs", JSON.stringify(newSavedJobs));
        return { success: true };
      } else {
        // Fallback to localStorage only
        const newSavedJobs = savedJobs.filter(id => id !== jobId);
        setSavedJobs(newSavedJobs);
        localStorage.setItem("savedJobs", JSON.stringify(newSavedJobs));
        return { success: true };
      }
    } catch (error) {
      console.error('Error unsaving job:', error);
      // Fallback to localStorage  
      const newSavedJobs = savedJobs.filter(id => id !== jobId);
      setSavedJobs(newSavedJobs);
      localStorage.setItem("savedJobs", JSON.stringify(newSavedJobs));
      return { success: true };
    }
  };

  // Legacy methods for backward compatibility
  const postJob = async (jobData) => {
    return await createJob(jobData);
  };

  const addUserJob = async (jobData) => {
    const result = await createJob(jobData);
    if (result.success) {
      const newUserJobs = [result.job, ...userJobs];
      setUserJobs(newUserJobs);
      localStorage.setItem("userJobs", JSON.stringify(newUserJobs));
    }
    return result;
  };

  const addCompany = async (companyData) => {
    return await createCompany(companyData);
  };

  const addApplication = async (applicationData) => {
    return await applyToJob(applicationData.job_id, applicationData);
  };

  const updateApplication = async (applicationId, updates) => {
    return await updateApplicationStatus(applicationId, updates.status, updates.feedback);
  };

  const value = {
    jobs,
    companies,
    savedJobs,
    userJobs,
    applications,
    loading,
    error,
    fetchJobs,
    fetchCompanies,
    fetchApplications,
    createJob,
    createCompany,
    saveJob,
    unsaveJob,
    applyToJob,
    updateApplicationStatus,
    postJob, // Legacy compatibility
    addUserJob,
    addCompany, // Legacy compatibility  
    addApplication,
    updateApplication,
    loadInitialData,
  };

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
};
