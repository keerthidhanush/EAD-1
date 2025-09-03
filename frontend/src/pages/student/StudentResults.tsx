// src/pages/student/StudentResults.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import DataTable from '../../components/DataTable';
import { Trophy, TrendingUp } from 'lucide-react';

// helper: accept string or populated doc and return its _id
const getId = (v: any): string | undefined =>
  typeof v === 'string' ? v : v && typeof v === 'object' && v._id ? v._id : undefined;

// helper: get course info from either populated result.courseId or courses list
const getCourseInfo = (res: any, courses: any[]) => {
  // if populated, res.courseId is an object with code/title
  if (res && res.courseId && typeof res.courseId === 'object') {
    return {
      code: res.courseId.code ?? 'Unknown',
      title: res.courseId.title ?? 'Unknown',
      id: res.courseId._id,
    };
  }
  // else, find by id in courses array
  const cid = getId(res?.courseId) || res?.courseId;
  const c = courses.find((cc: any) => cc._id === cid);
  return {
    code: c?.code ?? 'Unknown',
    title: c?.title ?? 'Unknown',
    id: cid,
  };
};

const StudentResults: React.FC = () => {
  const { user } = useAuth();
  const { results, courses, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const userId = user?.id;

  // only this student's results; supports studentId as string or populated object
  const myResults = useMemo(
    () => results.filter(r => getId(r.studentId) === userId),
    [results, userId]
  );

  // decorate rows with course code/title and safe date
  const rows = useMemo(() => {
    return myResults.map((r: any) => {
      const cinfo = getCourseInfo(r, courses);
      return {
        ...r,
        courseCode: cinfo.code,
        courseTitle: cinfo.title,
        assignedAtSafe: r.assignedAt ? new Date(r.assignedAt as any) : null,
      };
    });
  }, [myResults, courses]);

  // search filter
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      String(r.courseTitle || '').toLowerCase().includes(q) ||
      String(r.courseCode || '').toLowerCase().includes(q) ||
      String(r.grade || '').toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  // GPA from my results
  const calculateGPA = () => {
    if (myResults.length === 0) return '0.00';
    const gradePoints: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    const total = myResults.reduce((sum: number, r: any) => sum + (gradePoints[r.grade] ?? 0), 0);
    return (total / myResults.length).toFixed(2);
  };

  const getGradeColor = (grade: string) => {
    if (!grade) return 'text-gray-700 bg-gray-100';
    const g = grade.toUpperCase();
    if (g.startsWith('A')) return 'text-green-600 bg-green-50';
    if (g.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (g.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    if (g.startsWith('D')) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const columns = [
    { key: 'courseCode', label: 'Course Code' },
    { key: 'courseTitle', label: 'Course Title' },
    {
      key: 'grade',
      label: 'Grade',
      render: (grade: string) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade)}`}>
          {grade || '—'}
        </span>
      ),
    },
    {
      key: 'assignedAtSafe',
      label: 'Date Assigned',
      render: (d: Date | null) => (d ? d.toLocaleDateString() : '—'),
    },
  ];

  useEffect(() => {
    console.log('StudentResults state:', { results, myResults, user, loading });
  }, [results, myResults, user, loading]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading results...</p>
        </div>
      ) : myResults.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
          <p className="text-gray-600">
            Your grades will appear here once they're assigned by your instructors.
          </p>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
            <p className="text-gray-600 mt-2">View your academic performance and grades</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{myResults.length}</h3>
                  <p className="text-gray-600">Completed Courses</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{calculateGPA()}</h3>
                  <p className="text-gray-600">Current GPA</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {myResults.filter((r: any) => String(r.grade || '').toUpperCase().startsWith('A')).length}
                  </h3>
                  <p className="text-gray-600">A Grades</p>
                </div>
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredResults}
            searchPlaceholder="Search your results..."
            onSearch={setSearchQuery}
          />
        </>
      )}
    </div>
  );
};

export default StudentResults;