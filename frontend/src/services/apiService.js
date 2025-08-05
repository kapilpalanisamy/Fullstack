// RizeOS Job Portal - API Service
// Frontend to Backend Connection

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic API request method
  async apiRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.apiRequest('/health');
  }

  // Get server status
  async getServerInfo() {
    return this.apiRequest('/');
  }

  // Job-related API calls
  async getJobs(filters = {}) {
    let url = '/api/jobs';
    const params = new URLSearchParams();
    
    if (filters.location) params.append('location', filters.location);
    if (filters.job_type) params.append('job_type', filters.job_type);
    if (filters.experience_level) params.append('experience_level', filters.experience_level);
    if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await this.apiRequest(url);
    return {
      success: response.success || true,
      jobs: response.data || [],
      count: response.count || 0,
      message: response.message
    };
  }

  async getJob(id) {
    const response = await this.apiRequest(`/api/jobs/${id}`);
    return {
      success: response.success || true,
      job: response.data,
      message: response.message
    };
  }

  async createJob(jobData) {
    return this.apiRequest('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  // Company API calls
  async getCompanies() {
    const response = await this.apiRequest('/api/companies');
    return {
      success: response.success || true,
      companies: response.data || [],
      count: response.count || 0,
      message: response.message
    };
  }

  async createCompany(companyData) {
    return this.apiRequest('/api/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  // Authentication API calls
  async login(email, password) {
    const response = await this.apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  }

  async register(userData) {
    const response = await this.apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  }

  // User API calls
  async getUsers() {
    const response = await this.apiRequest('/api/users');
    return {
      success: response.success || true,
      users: response.data || [],
      count: response.count || 0,
      message: response.message
    };
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Named exports for individual methods
export const {
  checkHealth,
  getServerInfo,
  getJobs,
  getJob,
  createJob,
  login,
  register,
  getWalletInfo,
  connectWallet,
  getCompanies,
  createCompany,
  getUsers,
} = apiService;
