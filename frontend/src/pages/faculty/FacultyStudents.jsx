import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Mail,
  Phone,
  Award,
  BookOpen,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courseAPI } from '../../services/api';

const FacultyStudents = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFacultyCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse !== 'all') {
      fetchCourseStudents(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchFacultyCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAll();
      const allCourses = response.data?.courses || [];
      
      // Filter courses assigned to this faculty
      const myCourses = user?.role === 'faculty' && user?._id
        ? allCourses.filter(course => 
            course.instructor_id?._id === user._id || 
            course.instructor_id === user._id
          )
        : [];

      setCourses(myCourses);
      
      // Fetch students from all courses if 'all' is selected
      if (selectedCourse === 'all') {
        const allStudents = [];
        for (const course of myCourses) {
          try {
            const studentsResponse = await courseAPI.getStudents(course._id);
            const courseStudents = (studentsResponse.data?.students || []).map(s => ({
              ...s,
              courseName: course.name,
              courseCode: course.code
            }));
            allStudents.push(...courseStudents);
          } catch (err) {
            console.error(`Error fetching students for ${course.code}:`, err);
          }
        }
        setStudents(allStudents);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching faculty courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async (courseId) => {
    try {
      setLoading(true);
      const response = await courseAPI.getStudents(courseId);
      const courseData = courses.find(c => c._id === courseId);
      const studentsData = (response.data?.students || []).map(s => ({
        ...s,
        courseName: courseData?.name,
        courseCode: courseData?.code
      }));
      setStudents(studentsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching course students:', err);
      setError(err.message || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.student_id || student.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-card p-8 mb-8 border border-gray-100 overflow-hidden animate-slide-down">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full -mr-32 -mt-32 blur-2xl"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My <span className="text-gradient-primary">Students</span></h1>
            <p className="text-gray-600">View and manage your students' information and performance</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>

            {/* Course Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading students...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredStudents.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-gray-100">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No students match your search criteria.' : 'No students are enrolled in your courses yet.'}
            </p>
          </div>
        )}

        {/* Students Grid */}
        {!loading && filteredStudents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, index) => {
              const avatar = (student.name || 'ST').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              
              return (
                <div 
                  key={student._id || student.id} 
                  className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Student Avatar and Info */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform">
                      {avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{student.name}</h3>
                      <p className="text-sm text-gray-600 font-medium">{student.student_id || student.studentId || 'N/A'}</p>
                      <p className="text-xs text-gray-500 mt-1">{student.courseName || student.courseCode || 'Course'}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {student.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{student.email}</span>
                      </div>
                    )}
                    {student.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {student.phone}
                      </div>
                    )}
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Award className="h-4 w-4 text-accent-600 mr-1" />
                    <span className="text-sm text-gray-600">CGPA</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{student.cgpa || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <BookOpen className="h-4 w-4 text-secondary-600 mr-1" />
                    <span className="text-sm text-gray-600">Attendance</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{student.attendance || student.attendancePercentage || 'N/A'}{student.attendance ? '%' : ''}</p>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium">
                View Profile
              </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && students.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stat-card group">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="stat-card group">
              <div className="flex items-center">
                <div className="p-3 bg-accent-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Award className="h-6 w-6 text-accent-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Average CGPA</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.some(s => s.cgpa) 
                      ? (students.reduce((sum, s) => sum + (s.cgpa || 0), 0) / students.filter(s => s.cgpa).length).toFixed(2)
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card group">
              <div className="flex items-center">
                <div className="p-3 bg-secondary-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Avg Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.some(s => s.attendance) 
                      ? Math.round(students.reduce((sum, s) => sum + (s.attendance || 0), 0) / students.filter(s => s.attendance).length) + '%'
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card group">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyStudents;

