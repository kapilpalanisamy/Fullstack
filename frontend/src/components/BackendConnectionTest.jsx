// Backend Connection Test Component
import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const BackendConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [serverInfo, setServerInfo] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError(null);

      // Test 1: Health check
      console.log('Testing backend connection...');
      const health = await apiService.checkHealth();
      console.log('Health check:', health);

      // Test 2: Get server info
      const info = await apiService.getServerInfo();
      console.log('Server info:', info);
      setServerInfo(info);

      // Test 3: Get jobs with updated API format
      const jobsResponse = await apiService.getJobs();
      console.log('Jobs response:', jobsResponse);
      setJobs(jobsResponse.jobs || []);

      setConnectionStatus('connected');
    } catch (err) {
      console.error('Backend connection failed:', err);
      setError(err.message);
      setConnectionStatus('failed');
    }
  };

  const testLogin = async () => {
    try {
      const loginResult = await apiService.login({
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('Login test:', loginResult);
      alert('Login test successful! Check console for details.');
    } catch (err) {
      console.error('Login test failed:', err);
      alert(`Login test failed: ${err.message}`);
    }
  };

  const testCompanies = async () => {
    try {
      const companiesResponse = await apiService.getCompanies();
      console.log('Companies test:', companiesResponse);
      alert(`Companies test successful! Found ${companiesResponse.companies?.length || 0} companies. Check console for details.`);
    } catch (err) {
      console.error('Companies test failed:', err);
      alert(`Companies test failed: ${err.message}`);
    }
  };

  const testUsers = async () => {
    try {
      const usersResponse = await apiService.getUsers();
      console.log('Users test:', usersResponse);
      alert(`Users test successful! Found ${usersResponse.users?.length || 0} users. Check console for details.`);
    } catch (err) {
      console.error('Users test failed:', err);
      alert(`Users test failed: ${err.message}`);
    }
  };

  const testBlockchain = async () => {
    try {
      const walletInfo = await apiService.getWalletInfo();
      console.log('Blockchain test:', walletInfo);
      alert('Blockchain test successful! Check console for details.');
    } catch (err) {
      console.error('Blockchain test failed:', err);
      alert(`Blockchain test failed: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">🚀 Backend Connection Test</h2>
        
        {/* Connection Status */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Status:</span>
            {connectionStatus === 'testing' && (
              <span className="text-yellow-600">🔄 Testing connection...</span>
            )}
            {connectionStatus === 'connected' && (
              <span className="text-green-600">✅ Connected successfully!</span>
            )}
            {connectionStatus === 'failed' && (
              <span className="text-red-600">❌ Connection failed</span>
            )}
          </div>
          
          {error && (
            <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Server Info */}
        {serverInfo && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800 mb-2">📡 Server Information</h3>
            <div className="text-sm text-green-700">
              <p><strong>Message:</strong> {serverInfo.message}</p>
              <p><strong>Version:</strong> {serverInfo.version}</p>
              <p><strong>Status:</strong> {serverInfo.status}</p>
              <div className="mt-2">
                <strong>Features:</strong>
                <ul className="ml-4 list-disc">
                  <li>Blockchain: {serverInfo.features?.blockchain}</li>
                  <li>AI: {serverInfo.features?.ai}</li>
                  <li>Database: {serverInfo.features?.database}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={testBackendConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Test Connection
          </button>
          <button
            onClick={testLogin}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            🔐 Test Login
          </button>
          <button
            onClick={testCompanies}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            🏢 Test Companies
          </button>
          <button
            onClick={testUsers}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            👥 Test Users
          </button>
          <button
            onClick={testBlockchain}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            🦊 Test Blockchain
          </button>
        </div>

        {/* Jobs Data */}
        {jobs.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">💼 Sample Jobs from Backend</h3>
            <div className="grid gap-4">
              {jobs.map((job, index) => (
                <div key={job.id || index} className="p-4 border border-gray-200 rounded">
                  <h4 className="font-semibold">{job.title}</h4>
                  <p className="text-gray-600">
                    {job.company_name || job.company?.name} • {job.location}
                  </p>
                  {(job.salary_min || job.salary_max) && (
                    <p className="text-green-600 font-medium">
                      {job.salary_min && job.salary_max 
                        ? `${job.salary_currency || 'USD'} ${job.salary_min} - ${job.salary_max}`
                        : job.salary_min 
                        ? `${job.salary_currency || 'USD'} ${job.salary_min}+`
                        : `Up to ${job.salary_currency || 'USD'} ${job.salary_max}`
                      }
                    </p>
                  )}
                  <p className="text-sm text-blue-600">{job.job_type} • {job.experience_level}</p>
                  {job.application_deadline && (
                    <p className="text-sm text-purple-600">
                      Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Connection Details</h3>
          <div className="text-sm text-blue-700">
            <p><strong>Backend URL:</strong> http://localhost:5000</p>
            <p><strong>Frontend URL:</strong> http://localhost:5173 (or current port)</p>
            <p><strong>CORS:</strong> Enabled for frontend communication</p>
            <p className="mt-2">
              <strong>Available Endpoints:</strong>
            </p>
            <ul className="ml-4 list-disc">
              <li>GET /health - Health check</li>
              <li>GET /api/jobs - Job listings</li>
              <li>POST /api/auth/login - User login</li>
              <li>GET /api/blockchain/wallet - Blockchain info</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendConnectionTest;
