import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { Plus, Edit2, Trash2, Mail } from 'lucide-react';

const StudentsPage: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, loading } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', studentId: '', email: '', password: 'student123' });
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingStudent) {
        const updateData = { name: formData.name, email: formData.email };
        if (formData.password && formData.password !== 'student123') {
          (updateData as any).password = formData.password;
        }
        await updateStudent(editingStudent._id, updateData);
      } else {
        await addStudent(formData);
      }
      
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', studentId: '', email: '', password: 'student123' });
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({ name: student.name, studentId: student.studentId, email: student.email, password: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (student: any) => {
    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        await deleteStudent(student._id);
      } catch (error) {
        alert('Error: ' + (error as Error).message);
      }
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ name: '', studentId: '', email: '', password: 'student123' });
    setIsModalOpen(true);
  };

  const columns = [
    { key: 'studentId', label: 'Student ID' },
    { key: 'name', label: 'Full Name' },
    {
      key: 'email',
      label: 'Email',
      render: (email: string) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span>{email}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, student: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(student)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(student)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-2">Manage student profiles and accounts</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        searchPlaceholder="Search students by name, ID, or email..."
        onSearch={setSearchQuery}
        actions={
          <button
            onClick={openAddModal}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Student</span>
          </button>
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., John Smith"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student ID
            </label>
            <input
              type="text"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., S12345"
              disabled={!!editingStudent}
              required
            />
            {editingStudent && (
              <p className="text-xs text-gray-500 mt-1">Student ID cannot be changed</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., john.smith@student.university.edu"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {editingStudent && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={editingStudent ? "Enter new password..." : "student123"}
              required={!editingStudent}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (editingStudent ? 'Update Student' : 'Add Student')}
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

export default StudentsPage;