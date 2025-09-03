import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import StudentHome from './StudentHome';
import StudentCourses from './StudentCourses';
import StudentResults from './StudentResults';
import StudentProfile from './StudentProfile';

const StudentDashboard: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/courses" element={<StudentCourses />} />
        <Route path="/results" element={<StudentResults />} />
        <Route path="/profile" element={<StudentProfile />} />
      </Routes>
    </Layout>
  );
};

export default StudentDashboard;