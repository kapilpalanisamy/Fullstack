import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/apiService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage - but only as cache)
    const storedUser = localStorage.getItem("jobPortalUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Ensure user has a role (default to 'candidate' if not set)
      if (!parsedUser.role) {
        parsedUser.role = 'candidate';
      }
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);
      
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const token = response.data.token;
        
        // Store user data with token
        const userWithToken = { ...userData, token };
        setUser(userWithToken);
        localStorage.setItem("jobPortalUser", JSON.stringify(userWithToken));
        return { success: true, user: userWithToken };
      } else {
        return { success: false, error: response.error || response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.success && response.data?.user) {
        const newUser = response.data.user;
        const token = response.data.token;
        
        // Store user data with token
        const userWithToken = { ...newUser, token };
        setUser(userWithToken);
        localStorage.setItem("jobPortalUser", JSON.stringify(userWithToken));
        return { success: true, user: userWithToken };
      } else {
        return { success: false, error: response.error || response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Keep the old login method for backward compatibility but mark it as deprecated
  const loginDirect = (userData) => {
    console.warn('⚠️ Direct login is deprecated - use login(email, password) instead');
    console.log('🔐 LoginDirect called with userData:', userData);
    const userWithRole = {
      ...userData,
      role: userData.role || 'candidate',
      id: userData.id // Don't fallback to Date.now() - this causes UUID errors
    };
    
    if (!userWithRole.id) {
      console.error('❌ LoginDirect: No valid user ID provided!', userData);
      return;
    }
    
    setUser(userWithRole);
    localStorage.setItem("jobPortalUser", JSON.stringify(userWithRole));
  };

  const switchRole = (newRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem("jobPortalUser", JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jobPortalUser");
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("jobPortalUser", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    loginDirect, // Deprecated backward compatibility
    logout,
    updateUser,
    switchRole,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
