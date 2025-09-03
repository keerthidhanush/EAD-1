import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import AdminHome from './AdminHome';
import CoursesPage from './CoursesPage';
import StudentsPage from './StudentsPage';
import RegistrationsPage from './RegistrationsPage';
import ResultsPage from './ResultsPage';
import AdminProfile from './AdminProfile';

const AdminDashboard: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/registrations" element={<RegistrationsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/profile" element={<AdminProfile />} />
      </Routes>
    </Layout>
  );
};

export default AdminDashboard;