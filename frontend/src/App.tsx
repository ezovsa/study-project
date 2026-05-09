import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonDetail from './pages/LessonDetail';
import AssignmentDetail from './pages/AssignmentDetail';
import StudentAnalytics from './pages/StudentAnalytics';
import CourseAnalytics from './pages/CourseAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import Reports from './pages/Reports';

import TeacherSubmissions from './pages/TeacherSubmissions';
import MyCourses from './pages/teacher/MyCourses';
import CourseEditor from './pages/teacher/CourseEditor';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#7f8c8d' }}>Загрузка...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="lessons/:id" element={<LessonDetail />} />
        <Route path="assignments/:id" element={<AssignmentDetail />} />
        <Route path="analytics/student/:id" element={<StudentAnalytics />} />
        <Route path="analytics/course/:id" element={<CourseAnalytics />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="teacher/submissions" element={<TeacherSubmissions />} />
        <Route path="teacher/courses" element={<MyCourses />} />
        <Route path="teacher/courses/new" element={<CourseEditor />} />
        <Route path="teacher/courses/:id/edit" element={<CourseEditor />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
