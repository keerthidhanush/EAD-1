import React from 'react';
import { useData } from '../../contexts/DataContext';
import StatsCard from '../../components/StatsCard';
import { BookOpen, Users, UserCheck, Trophy } from 'lucide-react';

const AdminHome: React.FC = () => {
  const { courses, students, registrations, results, loading } = useData();

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Manage your university's course system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Courses"
          value={courses.length}
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Total Students"
          value={students.length}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Active Registrations"
          value={registrations.length}
          icon={UserCheck}
          color="yellow"
        />
        <StatsCard
          title="Grades Assigned"
          value={results.length}
          icon={Trophy}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              <p className="text-sm text-gray-700">5 new course registrations today</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              <p className="text-sm text-gray-700">3 grades assigned this week</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
              <p className="text-sm text-gray-700">2 new students added</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Add Course</span>
            </button>
            <button className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Add Student</span>
            </button>
            <button className="p-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-center">
              <UserCheck className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Register Student</span>
            </button>
            <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Assign Grade</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;