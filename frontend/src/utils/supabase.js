// Legacy Supabase file - DEPRECATED
// This file is kept for compatibility but is no longer used
// All API calls now go through the backend API service

console.warn("⚠️ supabase.js is deprecated. All API calls should use the backend API service instead.");

// Placeholder functions to prevent import errors
export const supabaseUrl = null;

const supabaseClient = async () => {
  throw new Error("Direct Supabase access is deprecated. Use backend API service instead.");
};

export default supabaseClient;
