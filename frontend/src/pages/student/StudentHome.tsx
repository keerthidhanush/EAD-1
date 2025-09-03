import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import StatsCard from '../../components/StatsCard';
import { BookOpen, Trophy, Clock, Award } from 'lucide-react';

// normalize possible string | {_id:string}
const getId = (v: any): string | undefined =>
  typeof v === 'string' ? v : v && typeof v === 'object' ? v._id : undefined;

const StudentHome: React.FC = () => {
  const { user } = useAuth();
  const { registrations, results, courses, loading, studentGpa } = useData();
  const userId = user?.id;

  const studentRegistrations = useMemo(
    () => registrations.filter(reg => getId(reg.studentId) === userId),
    [registrations, userId]
  );

  const studentResults = useMemo(
    () => results.filter(r => getId(r.studentId) === userId),
    [results, userId]
  );

  const registeredCourses = useMemo(() => {
    return studentRegistrations
      .map(reg => courses.find(c => c._id === getId(reg.courseId)))
      .filter(Boolean) as typeof courses;
  }, [studentRegistrations, courses]);

  const completedCourseIds = useMemo(() => {
    const set = new Set<string>();
    studentResults.forEach(r => {
      const cid = getId(r.courseId);
      if (cid) set.add(cid);
    });
    return set;
  }, [studentResults]);

  const completedCourses = completedCourseIds.size;
  const pendingCourses = Math.max(studentRegistrations.length - completedCourses, 0);

  // fallback GPA if context didn't provide one
  const calcGPA = () => {
    if (typeof studentGpa === 'number') return studentGpa.toFixed(2);
    if (studentResults.length === 0) return '0.00';
    const gp: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0,
    };
    const total = studentResults.reduce((s, r) => s + (gp[r.grade] ?? 0), 0);
    return (total / studentResults.length).toFixed(2);
  };

  const recentResults = useMemo(() => {
    const list = studentResults
      .slice()
      .sort((a, b) => new Date(b.assignedAt as any).getTime() - new Date(a.assignedAt as any).getTime())
      .slice(0, 3)
      .map(r => {
        const course = courses.find(c => c._id === getId(r.courseId));
        return { ...r, courseTitle: course?.title, courseCode: course?.code };
      });
    return list;
  }, [studentResults, courses]);

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's your academic overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Registered Courses" value={studentRegistrations.length} icon={BookOpen} color="blue" />
        <StatsCard title="Completed Courses" value={completedCourses} icon={Trophy} color="green" />
        <StatsCard title="Pending Courses" value={pendingCourses} icon={Clock} color="yellow" />
        <StatsCard title="Current GPA" value={calcGPA()} icon={Award} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Grades</h3>
          {recentResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No grades assigned yet</p>
          ) : (
            <div className="space-y-4">
              {recentResults.map(result => (
                <div key={(result as any)._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{(result as any).courseCode || '—'}</p>
                    <p className="text-sm text-gray-600">{(result as any).courseTitle || '—'}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {result.grade}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Courses</h3>
          {registeredCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No courses registered</p>
          ) : (
            <div className="space-y-4">
              {registeredCourses.slice(0, 4).map(course => (
                <div key={course._id} className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{course.code}</p>
                    <p className="text-sm text-gray-600">{course.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
