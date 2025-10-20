import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DepartmentsPage from './pages/DepartmentsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import StudentRegistration from './pages/auth/StudentRegistration';
import FacultyRegistration from './pages/auth/FacultyRegistration';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentCourses from './pages/student/StudentCourses';
import StudentGrades from './pages/student/StudentGrades';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentAssignments from './pages/student/StudentAssignments';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyProfile from './pages/faculty/FacultyProfile';
import FacultyCourses from './pages/faculty/FacultyCourses';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyAssignments from './pages/faculty/FacultyAssignments';
import ScheduleClass from './pages/faculty/ScheduleClass';
import VirtualClasses from './pages/faculty/VirtualClasses';
import MarkAttendance from './pages/faculty/MarkAttendance';
import GradeSubmissions from './pages/faculty/GradeSubmissions';
import EnterGrades from './pages/faculty/EnterGrades';
import StudentVirtualClasses from './pages/student/StudentVirtualClasses';
import VirtualClassroom from './pages/virtual/VirtualClassroom';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCourses from './pages/admin/ManageCourses';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import ManageStudents from './pages/admin/ManageStudents';
import ManageFaculty from './pages/admin/ManageFaculty';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-100 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/admissions" element={<AdmissionsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Registration Routes (Admin-only links) */}
                <Route path="/register/student" element={<StudentRegistration />} />
                <Route path="/register/faculty" element={<FacultyRegistration />} />
                
                {/* Student Routes */}
                <Route path="/student" element={
                  <ProtectedRoute role="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/student/profile" element={
                  <ProtectedRoute role="student">
                    <StudentProfile />
                  </ProtectedRoute>
                } />
                <Route path="/student/courses" element={
                  <ProtectedRoute role="student">
                    <StudentCourses />
                  </ProtectedRoute>
                } />
                <Route path="/student/grades" element={
                  <ProtectedRoute role="student">
                    <StudentGrades />
                  </ProtectedRoute>
                } />
                <Route path="/student/virtual-classes" element={
                  <ProtectedRoute role="student">
                    <StudentVirtualClasses />
                  </ProtectedRoute>
                } />
                <Route path="/student/attendance" element={
                  <ProtectedRoute role="student">
                    <StudentAttendance />
                  </ProtectedRoute>
                } />
                <Route path="/student/assignments" element={
                  <ProtectedRoute role="student">
                    <StudentAssignments />
                  </ProtectedRoute>
                } />
                
                {/* Faculty Routes */}
                <Route path="/faculty" element={
                  <ProtectedRoute role="faculty">
                    <FacultyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/profile" element={
                  <ProtectedRoute role="faculty">
                    <FacultyProfile />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/courses" element={
                  <ProtectedRoute role="faculty">
                    <FacultyCourses />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/students" element={
                  <ProtectedRoute role="faculty">
                    <FacultyStudents />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/assignments" element={
                  <ProtectedRoute role="faculty">
                    <FacultyAssignments />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/schedule-class" element={
                  <ProtectedRoute role="faculty">
                    <ScheduleClass />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/virtual-classes" element={
                  <ProtectedRoute role="faculty">
                    <VirtualClasses />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/mark-attendance" element={
                  <ProtectedRoute role="faculty">
                    <MarkAttendance />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/grade-submissions" element={
                  <ProtectedRoute role="faculty">
                    <GradeSubmissions />
                  </ProtectedRoute>
                } />
                <Route path="/faculty/enter-grades" element={
                  <ProtectedRoute role="faculty">
                    <EnterGrades />
                  </ProtectedRoute>
                } />
                
                {/* Virtual Classroom */}
                <Route path="/classroom/:classId" element={
                  <ProtectedRoute>
                    <VirtualClassroom />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/courses" element={
                  <ProtectedRoute role="admin">
                    <ManageCourses />
                  </ProtectedRoute>
                } />
                <Route path="/admin/students" element={
                  <ProtectedRoute role="admin">
                    <ManageStudents />
                  </ProtectedRoute>
                } />
                <Route path="/admin/faculty" element={
                  <ProtectedRoute role="admin">
                    <ManageFaculty />
                  </ProtectedRoute>
                } />
                <Route path="/admin/announcements" element={
                  <ProtectedRoute role="admin">
                    <ManageAnnouncements />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
