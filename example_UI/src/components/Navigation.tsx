import { GraduationCap, Users, BookOpen } from 'lucide-react';
import type { UserRole, Screen } from '../App';

interface NavigationProps {
  currentRole: UserRole;
  currentScreen: Screen;
  onRoleChange: (role: UserRole) => void;
  onScreenChange: (screen: Screen) => void;
}

export function Navigation({ currentRole, onRoleChange, onScreenChange }: NavigationProps) {
  const handleRoleChange = (role: UserRole) => {
    onRoleChange(role);
    // Auto-navigate to default screen for each role
    if (role === 'teacher') onScreenChange('teacher-dashboard');
    if (role === 'parent') onScreenChange('parent-dashboard');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">MathAI Tutor</h1>
              <p className="text-xs text-gray-500">Hệ thống gia sư toán AI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRoleChange('teacher')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentRole === 'teacher'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Giáo viên</span>
            </button>
            
            <button
              onClick={() => handleRoleChange('parent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentRole === 'parent'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Phụ huynh</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}