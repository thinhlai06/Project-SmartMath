import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './app/providers/query-provider';
import { ToastProvider } from './components/ui/toast';
import { CPAStepWizard } from './components/cpa/CPAStepWizard';
import { DifferentiationWizard } from './components/differentiation/DifferentiationWizard';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage, RegisterPage, HomePage, ClassesPage, ClassDetailPage, WorksheetsPage, WorksheetEditorPage } from './pages';
import { GradebookPage } from './pages/GradebookPage';
import { Navigation } from './components/Navigation';
import ParentDashboardPage from './pages/ParentDashboardPage';
import ParentSolutionsPage from './pages/ParentSolutionsPage';
import StudentExperiencePage from './pages/StudentExperiencePage';
import AIGradingPage from './pages/AIGradingPage';
import ErrorAnalyticsPage from './pages/ErrorAnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import GradebookHubPage from './pages/GradebookHubPage';
import './index.css';

type UserRole = 'teacher' | 'parent';

// Protected route wrapper
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

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

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'parent' ? '/parent' : '/classes';
    return <Navigate to={fallback} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-4 print:pt-0">{children}</div>
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
          <ProtectedRoute allowedRoles={['teacher']}>
            <ClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes/:classId"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <ClassDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes/:classId/worksheets"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <WorksheetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gradebook"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <GradebookHubPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes/:classId/gradebook"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <GradebookPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worksheets/:worksheetId/edit"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <WorksheetEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/differentiation-wizard"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <DifferentiationWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cpa-wizard"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <CPAStepWizard />
          </ProtectedRoute>
        }
      />
      {/* Parent routes */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/class/:classId"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/solutions/:worksheetId"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentSolutionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/student"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <StudentExperiencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent/student/:studentId"
        element={
          <ProtectedRoute allowedRoles={['parent']}>
            <StudentExperiencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-grading"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <AIGradingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/error-analytics"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <ErrorAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'parent']}>
            <SettingsPage />
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
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}

export default App;
