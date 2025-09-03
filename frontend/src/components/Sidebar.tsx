import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  GraduationCap, 
  Home, 
  BookOpen, 
  Users, 
  UserCheck, 
  Trophy,
  User
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/registrations', icon: UserCheck, label: 'Registrations' },
    { path: '/admin/results', icon: Trophy, label: 'Results' },
    { path: '/admin/profile', icon: User, label: 'Profile' }
  ];

  const studentMenuItems = [
    { path: '/student', icon: Home, label: 'Dashboard' },
    { path: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { path: '/student/results', icon: Trophy, label: 'My Results' },
    { path: '/student/profile', icon: User, label: 'Profile' }
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">University</h1>
            <p className="text-sm text-gray-600">Course Management</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;