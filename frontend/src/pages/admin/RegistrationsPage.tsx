import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Trash2 } from 'lucide-react';

// Helper to get a string id from string | {_id: string} | null/undefined
const getId = (v: any): string | undefined =>
  typeof v === 'string' ? v : (v && typeof v === 'object' ? v._id : undefined);

const RegistrationsPage: React.FC = () => {
  const { 
    registrations, 
    students, 
    courses, 
    addRegistration, 
    deleteRegistration,
    loading
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    studentId: '', 
    courseId: '', 
    semester: 'Fall 2024', 
    academicYear: '2024-2025'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Safely enrich registrations with student/course details
  const registrationsWithDetails = registrations.map(reg => {
    const sid = getId(reg.studentId);
    const cid = getId(reg.courseId);
    const student = students.find(s => s._id === sid);
    const course  = courses.find(c => c._id === cid);

    return {
      ...reg,
      _id: reg._id,
      studentId: sid,
      courseId: cid,
      studentName: student?.name || 'Unknown',
      studentIdDisplay: student?.studentId || 'Unknown',
      courseCode: course?.code || 'Unknown',
      courseTitle: course?.title || 'Unknown',
      status: reg.status || 'active',
      semester: reg.semester || '',
      academicYear: reg.academicYear || ''
    };
  });

  const filteredRegistrations = registrationsWithDetails.filter(reg => {
    const q = searchQuery.toLowerCase();
    return (
      (reg.studentName || '').toLowerCase().includes(q) ||
      (reg.courseCode || '').toLowerCase().includes(q) ||
      (reg.courseTitle || '').toLowerCase().includes(q)
    );
  });

  // Prevent duplicate (studentId, courseId) selections — normalize first
  const availableStudents = students.filter(student => 
    !registrations.some(reg => getId(reg.studentId) === student._id && getId(reg.courseId) === formData.courseId)
  );

  const availableCourses = courses.filter(course => 
    !registrations.some(reg => getId(reg.courseId) === course._id && getId(reg.studentId) === formData.studentId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addRegistration({
        studentId: formData.studentId,
        courseId: formData.courseId,
        semester: formData.semester,
        academicYear: formData.academicYear,
        // status is optional (backend default = 'active')
      } as any);
      setIsModalOpen(false);
      setFormData({ studentId: '', courseId: '', semester: 'Fall 2024', academicYear: '2024-2025' });
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (registration: any) => {
    if (confirm(`Are you sure you want to remove ${registration.studentName} from ${registration.courseTitle}?`)) {
      try {
        await deleteRegistration(registration._id);
      } catch (error) {
        alert('Error: ' + (error as Error).message);
      }
    }
  };

  const columns = [
    { key: 'studentName', label: 'Student Name' },
    { key: 'studentIdDisplay', label: 'Student ID' },
    { key: 'courseCode', label: 'Course Code' },
    { key: 'courseTitle', label: 'Course Title' },
    { key: 'semester', label: 'Semester' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'status', label: 'Status' },
    {
      key: 'registrationDate',
      label: 'Registered Date',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-')
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, registration: any) => (
        <button
          onClick={() => handleDelete(registration)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={`Delete registration ${registration._id}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registration Management</h1>
          <p className="text-gray-600 mt-2">Manage student course registrations</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredRegistrations}
        searchPlaceholder="Search registrations by student or course..."
        onSearch={setSearchQuery}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Register Student</span>
          </button>
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Student for Course"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            >
              <option value="">Choose a student...</option>
              {availableStudents.map(student => (
                <option key={student._id} value={student._id}>
                  {student.studentId} - {student.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            >
              <option value="">Choose a course...</option>
              {availableCourses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g., Fall 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="e.g., 2024-2025"
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Student'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RegistrationsPage;
