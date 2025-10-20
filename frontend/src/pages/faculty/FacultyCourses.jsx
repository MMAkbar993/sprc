import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Video, 
  FileText,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courseAPI } from '../../services/api';

const FacultyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    fetchFacultyCourses();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [selectedSemester, selectedCourse, courses]);

  const fetchFacultyCourses = async () => {
    try {
      setLoading(true);
      // Fetch all courses
      const response = await courseAPI.getAll();
      const allCourses = response.data?.courses || [];
      
      // Debug logging
      console.log('=== Faculty Courses Debug ===');
      console.log('Current User:', user);
      console.log('User ID:', user?._id);
      console.log('User Role:', user?.role);
      console.log('Total Courses in Database:', allCourses.length);
      console.log('All Courses:', allCourses);
      
      // Filter courses assigned to this faculty member
      const myCourses = user?.role === 'faculty' && user?._id
        ? allCourses.filter(course => {
            const instructorId = course.instructor_id?._id || course.instructor_id;
            const userId = user._id;
            const matches = instructorId === userId || instructorId?.toString() === userId?.toString();
            
            console.log(`Course: ${course.name}, Instructor ID: ${instructorId}, User ID: ${userId}, Matches: ${matches}`);
            
            return matches;
          })
        : [];

      console.log('Filtered Courses for Faculty:', myCourses);
      console.log('=========================');

      setCourses(myCourses);
      setFilteredCourses(myCourses);
      setError(null);
    } catch (err) {
      console.error('Error fetching faculty courses:', err);
      setError(err.message || 'Failed to load courses');
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Filter by semester
    if (selectedSemester) {
      filtered = filtered.filter(course => course.semester?.toString() === selectedSemester);
    }

    // Filter by specific course
    if (selectedCourse) {
      filtered = filtered.filter(course => course._id === selectedCourse || course.id === selectedCourse);
    }

    setFilteredCourses(filtered);
  };

  const semesters = [
    { id: '', name: 'All Semesters' },
    { id: '1', name: 'Semester 1' },
    { id: '2', name: 'Semester 2' },
    { id: '3', name: 'Semester 3' },
    { id: '4', name: 'Semester 4' },
    { id: '5', name: 'Semester 5' },
    { id: '6', name: 'Semester 6' },
    { id: '7', name: 'Semester 7' },
    { id: '8', name: 'Semester 8' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-card p-8 mb-8 border border-gray-100 overflow-hidden animate-slide-down">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full -mr-32 -mt-32 blur-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My <span className="text-gradient-primary">Courses</span></h1>
              <p className="text-gray-600">
                Manage your courses, assignments, and student progress
                {!loading && <span className="ml-2 font-semibold text-primary-600">({courses.length} total courses)</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        {!loading && courses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-gray-100 hover:shadow-card-hover transition-all duration-300 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></div>
              Filter Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Semester Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <div className="flex flex-wrap gap-2">
                  {semesters.map((semester, index) => (
                    <button
                      key={semester.id}
                      onClick={() => {
                        setSelectedSemester(semester.id);
                        setSelectedCourse(''); // Reset course selection when changing semester
                      }}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                        selectedSemester === semester.id
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft hover:shadow-medium scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      {semester.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Selection Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Specific Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white text-gray-900"
                >
                  <option value="">All Courses</option>
                  {courses
                    .filter(course => !selectedSemester || course.semester?.toString() === selectedSemester)
                    .map(course => (
                      <option key={course._id || course.id} value={course._id || course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-semibold text-primary-600">{filteredCourses.length}</span> of <span className="font-semibold">{courses.length}</span> courses
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your courses...</p>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCourses.map((course, index) => (
            <div 
              key={course.id} 
              className="relative bg-white rounded-2xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 group overflow-hidden animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Decorative gradient background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              
              {/* Course Header */}
              <div className="relative flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{course.name}</h3>
                  <p className="text-sm text-gray-600 font-medium">{course.code}</p>
                  {course.credit_hours && (
                    <p className="text-xs text-gray-500 mt-1">{course.credit_hours}</p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-soft transition-all duration-300 group-hover:scale-110 ${
                  course.is_virtual 
                    ? 'bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700' 
                    : 'bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-700'
                }`}>
                  {course.is_virtual ? 'Virtual' : 'On-Campus'}
                </div>
              </div>

              {/* Course Details */}
              <div className="relative space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                  <Users className="h-4 w-4 mr-2 text-primary-500" />
                  {course.enrolledCount || 0} Students Enrolled
                </div>
                {course.schedule?.days && course.schedule?.time && (
                  <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    <Clock className="h-4 w-4 mr-2 text-secondary-500" />
                    {course.schedule.days.join(', ')} - {course.schedule.time}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                  <FileText className="h-4 w-4 mr-2 text-accent-500" />
                  {course.credits} Credits • Semester {course.semester}
                </div>
              </div>

              {/* Department Info */}
              {course.department_id && (
                <div className="relative mb-4 p-3 bg-gradient-to-r from-primary-50 to-transparent rounded-lg">
                  <div className="text-xs text-gray-600">
                    Department: <span className="font-semibold text-primary-700">{course.department_id.code || course.department_id.name || 'N/A'}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="relative flex space-x-2">
                {course.is_virtual ? (
                  <Link
                    to={`/classroom/${course._id || course.id}`}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 text-center shadow-soft hover:shadow-medium hover:scale-105 group/btn"
                  >
                    <Video className="h-4 w-4 inline mr-1 group-hover/btn:scale-110 transition-transform" />
                    Start Class
                  </Link>
                ) : (
                  <Link
                    to={`/faculty/students`}
                    className="flex-1 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:from-secondary-600 hover:to-secondary-700 transition-all duration-300 shadow-soft hover:shadow-medium hover:scale-105 text-center"
                  >
                    View Students
                  </Link>
                )}
                <Link 
                  to="/faculty/enter-grades"
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-soft"
                  title="Enter Grades"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Empty State - No Courses Assigned */}
        {!loading && courses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-gray-100">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Assigned</h3>
            <p className="text-gray-600 mb-4">You don't have any courses assigned yet. Contact the admin to assign courses.</p>
            <Link
              to="/faculty/dashboard"
              className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* Empty State - No Matching Filters */}
        {!loading && courses.length > 0 && filteredCourses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-gray-100">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600 mb-4">No courses match your selected filters. Try selecting different options.</p>
            <button
              onClick={() => {
                setSelectedSemester('');
                setSelectedCourse('');
              }}
              className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Course Stats */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stat-card group animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Displayed Courses</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform inline-block">{filteredCourses.length}</p>
                </div>
              </div>
            </div>

            <div className="stat-card group animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center">
                <div className="p-3 bg-accent-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Users className="h-6 w-6 text-accent-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform inline-block">
                    {filteredCourses.reduce((sum, course) => sum + (course.enrolledCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card group animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center">
                <div className="p-3 bg-secondary-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Video className="h-6 w-6 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Virtual Classes</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform inline-block">
                    {filteredCourses.filter(course => course.is_virtual).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card group animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Total Credits</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform inline-block">
                    {filteredCourses.reduce((sum, course) => sum + (course.credits || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyCourses;

