import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";

import AppLayout from "./layouts/app-layout";
import ProtectedRoute from "./components/protected-route";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";
import { JobsProvider } from "./contexts/JobsContext";
import { WalletProvider } from "./contexts/WalletContext";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load components for better performance
const LandingPage = lazy(() => import("./pages/landing"));
import SmartDashboard from "./pages/SmartDashboard";
const Onboarding = lazy(() => import("./pages/onboarding"));
const PostJob = lazy(() => import("./pages/EnhancedPostJob"));
const JobListing = lazy(() => import("./pages/jobListing"));
const MyJobs = lazy(() => import("./pages/my-jobs"));
const SavedJobs = lazy(() => import("./pages/saved-jobs"));
const JobPage = lazy(() => import("./pages/job"));
const AIJobs = lazy(() => import("./pages/AIJobs"));
const SocialFeed = lazy(() => import("./components/SocialFeed"));
const JobMatching = lazy(() => import("./components/JobMatching"));
const SkillExtraction = lazy(() => import("./components/SkillExtraction"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BackendConnectionTest = lazy(() => import("./components/BackendConnectionTest"));

import "./App.css";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <SmartDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/onboarding",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Onboarding />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/jobs",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <JobListing />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/ai-jobs",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ErrorBoundary>
                <AIJobs />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/social-feed",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SocialFeed />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/post-job",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <PostJob />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-jobs",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <MyJobs />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/saved-jobs",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SavedJobs />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/job/:id",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <JobPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/social",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SocialFeed />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/job-matching",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ErrorBoundary>
                <JobMatching />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/skill-analysis",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SkillExtraction />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/backend-test",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BackendConnectionTest />
          </Suspense>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <WalletProvider>
            <JobsProvider>
              <RouterProvider router={router} />
            </JobsProvider>
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
