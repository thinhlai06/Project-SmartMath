import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CPAStepWizard } from './components/cpa/CPAStepWizard';
import { DifferentiationWizard } from './components/differentiation/DifferentiationWizard';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage, RegisterPage, HomePage, ClassesPage, ClassDetailPage, WorksheetsPage, WorksheetEditorPage } from './pages';
import { Navigation } from './components/Navigation';
import ParentDashboardPage from './pages/ParentDashboardPage';
import ParentSolutionsPage from './pages/ParentSolutionsPage';
import StudentExperiencePage from './pages/StudentExperiencePage';
import AIGradingPage from './pages/AIGradingPage';
import ErrorAnalyticsPage from './pages/ErrorAnalyticsPage';
import './index.css';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}

// Guest route wrapper (redirect if already logged in)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      {/* Teacher routes */}
      <Route
        path="/classes"
        element={
          <ProtectedRoute>
            <ClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes/:classId"
        element={
          <ProtectedRoute>
            <ClassDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes/:classId/worksheets"
        element={
          <ProtectedRoute>
            <WorksheetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worksheets/:worksheetId/edit"
        element={
          <ProtectedRoute>
            <WorksheetEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/differentiation-wizard"
        element={
          <ProtectedRoute>
            <DifferentiationWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cpa-wizard"
        element={
          <ProtectedRoute>
            <CPAStepWizard />
          </ProtectedRoute>
        }
      />
      {/* Parent routes */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute>
            <ParentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/class/:classId"
        element={
          <ProtectedRoute>
            <ParentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/solutions/:worksheetId"
        element={
          <ProtectedRoute>
            <ParentSolutionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/student"
        element={
          <ProtectedRoute>
            <StudentExperiencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-grading"
        element={
          <ProtectedRoute>
            <AIGradingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/error-analytics"
        element={
          <ProtectedRoute>
            <ErrorAnalyticsPage />
          </ProtectedRoute>
        }
      />
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
