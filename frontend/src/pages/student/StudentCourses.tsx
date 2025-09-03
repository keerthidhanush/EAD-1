import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import DataTable from '../../components/DataTable';
import { BookOpen, Clock, Trophy } from 'lucide-react';

// Normalize: string | {_id:string} -> string | undefined
const getId = (v: any): string | undefined =>
  typeof v === 'string' ? v : v && typeof v === 'object' ? v._id : undefined;

const StudentCourses: React.FC = () => {
  const { user } = useAuth();
  const { registrations, courses, results, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const userId = user?.id;

  // Only registrations of the logged-in student
  const studentRegistrations = useMemo(
    () => registrations.filter(reg => getId(reg.studentId) === userId),
    [registrations, userId]
  );

  // Build rows: join course details + result-derived grade/status
  const rows = useMemo(() => {
    return studentRegistrations.map(reg => {
      const regCourseId = getId(reg.courseId);
      const course = courses.find(c => c._id === regCourseId);

      const result = results.find(
        r => getId(r.studentId) === userId && getId(r.courseId) === regCourseId
      );

      // Prefer backend registration.status, fallback to presence of result
      const serverStatus = (reg.status || '').toLowerCase();
      const derivedStatus =
        serverStatus === 'completed' || serverStatus === 'active'
          ? serverStatus
          : result
          ? 'completed'
          : 'active';

      const prettyStatus = derivedStatus === 'completed' ? 'Completed' : 'In Progress';

      return {
        id: reg._id,
        code: course?.code || 'Unknown',
        title: course?.title || 'Unknown',
        registeredAt: reg.registrationDate,
        status: prettyStatus,
        grade: result?.grade || 'Pending',
      };
    });
  }, [studentRegistrations, courses, results, userId]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  const columns = [
    { key: 'code', label: 'Course Code' },
    { key: 'title', label: 'Course Title' },
    {
      key: 'grade',
      label: 'Grade',
      render: (g: string) => g || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'Completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {status === 'Completed' ? (
            <Trophy className="inline h-4 w-4 mr-1" />
          ) : (
            <Clock className="inline h-4 w-4 mr-1" />
          )}
          {status}
        </span>
      ),
    },
    {
      key: 'registeredAt',
      label: 'Registered Date',
      render: (date: string | Date) => {
        const d = new Date(date as any);
        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
      },
    },
  ];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">View your registered courses and progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {rows.length}
              </h3>
              <p className="text-gray-600">Total Registered</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {rows.filter(c => c.status === 'Completed').length}
              </h3>
              <p className="text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search your courses..."
        onSearch={setSearchQuery}
      />
    </div>
  );
};

export default StudentCourses;
