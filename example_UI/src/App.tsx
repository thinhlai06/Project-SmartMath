import { useState } from 'react';
import { TeacherDashboard } from './components/TeacherDashboard';
import { CPADesigner } from './components/CPADesigner';
import { DifferentiationScreen } from './components/DifferentiationScreen';
import { PDFExportScreen } from './components/PDFExportScreen';
import { AIGradingScreen } from './components/AIGradingScreen';
import { ErrorAnalytics } from './components/ErrorAnalytics';
import { ParentDashboard } from './components/ParentDashboard';
import { ParentSolutions } from './components/ParentSolutions';
import { StudentExperience } from './components/StudentExperience';
import { Navigation } from './components/Navigation';
import { Welcome } from './components/Welcome';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer, useToast } from './components/Toast';

export type UserRole = 'teacher' | 'parent';
export type Screen = 
  | 'teacher-dashboard'
  | 'cpa-designer'
  | 'differentiation'
  | 'pdf-export'
  | 'ai-grading'
  | 'error-analytics'
  | 'parent-dashboard'
  | 'parent-solutions'
  | 'student-experience';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('teacher-dashboard');
  const { toasts } = useToast();

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'teacher') {
      setCurrentScreen('teacher-dashboard');
    } else {
      setCurrentScreen('parent-dashboard');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'teacher-dashboard':
        return <TeacherDashboard onNavigate={setCurrentScreen} />;
      case 'cpa-designer':
        return <CPADesigner onBack={() => setCurrentScreen('teacher-dashboard')} />;
      case 'differentiation':
        return <DifferentiationScreen onBack={() => setCurrentScreen('teacher-dashboard')} />;
      case 'pdf-export':
        return <PDFExportScreen onBack={() => setCurrentScreen('teacher-dashboard')} />;
      case 'ai-grading':
        return <AIGradingScreen onBack={() => setCurrentScreen('teacher-dashboard')} />;
      case 'error-analytics':
        return <ErrorAnalytics onBack={() => setCurrentScreen('teacher-dashboard')} />;
      case 'parent-dashboard':
        return <ParentDashboard onNavigate={setCurrentScreen} />;
      case 'parent-solutions':
        return <ParentSolutions onBack={() => setCurrentScreen('parent-dashboard')} />;
      case 'student-experience':
        return <StudentExperience />;
      default:
        return <TeacherDashboard onNavigate={setCurrentScreen} />;
    }
  };

  // Show welcome screen if no role selected
  if (!currentRole) {
    return (
      <ErrorBoundary>
        <Welcome onSelectRole={handleRoleSelect} />
        <ToastContainer toasts={toasts} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
        <Navigation 
          currentRole={currentRole}
          currentScreen={currentScreen}
          onRoleChange={(role) => {
            setCurrentRole(role);
            if (role === 'teacher') {
              setCurrentScreen('teacher-dashboard');
            } else {
              setCurrentScreen('parent-dashboard');
            }
          }}
          onScreenChange={setCurrentScreen}
        />
        <main className="pt-20 pb-8">
          {renderScreen()}
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </ErrorBoundary>
  );
}