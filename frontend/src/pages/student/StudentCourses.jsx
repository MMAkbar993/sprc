import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Video, 
  FileText, 
  Download,
  Calendar,
  CheckCircle,
  Loader
} from 'lucide-react';
import { studentAPI } from '../../services/api';

const StudentCourses = () => {
  const [selectedSemester, setSelectedSemester] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [selectedSemester]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getCourses(selectedSemester || undefined);
      const coursesData = response.data?.courses || [];
      
      // Debug logging
      console.log('=== Student Courses Debug ===');
      console.log('Selected Semester:', selectedSemester);
      console.log('API Response:', response.data);
      console.log('Courses Found:', coursesData.length);
      console.log('Courses:', coursesData);
      console.log('=========================');
      
      setCourses(coursesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
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
              <p className="text-gray-600">Track your academic progress and course materials</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-xl animate-bounce-slow">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Semester Selector */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-gray-100 hover:shadow-card-hover transition-all duration-300 animate-fade-in">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></div>
            Select Semester
          </h2>
          <div className="flex flex-wrap gap-3">
            {semesters.map((semester, index) => (
              <button
                key={semester.id}
                onClick={() => setSelectedSemester(semester.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 animate-scale-in ${
                  selectedSemester === semester.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft hover:shadow-medium scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {semester.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading courses...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-2xl shadow-card p-8 border border-gray-100 text-center">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Courses</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchCourses}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
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
                  {course.instructor_name || course.instructor_id?.name || 'TBA'}
                </div>
                {course.schedule?.time && (
                  <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    <Clock className="h-4 w-4 mr-2 text-secondary-500" />
                    {course.schedule.days?.join(', ')} - {course.schedule.time}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                  <FileText className="h-4 w-4 mr-2 text-accent-500" />
                  {course.credit_hours || `${course.credits} Credits`}
                </div>
                {course.semester && (
                  <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    <BookOpen className="h-4 w-4 mr-2 text-purple-500" />
                    Semester {course.semester}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {course.progress !== undefined && (
                <div className="relative mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">Progress</span>
                    <span className="text-primary-600 font-semibold">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 h-2.5 rounded-full transition-all duration-500 group-hover:animate-gradient bg-200%"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Assignments */}
              {course.assignments !== undefined && (
                <div className="relative mb-4 p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Pending Assignments</span>
                    <span className={`font-bold px-2 py-1 rounded-full text-xs ${
                      course.assignments > 0 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {course.assignments}
                    </span>
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="relative mb-4 p-3 bg-gradient-to-r from-primary-50 to-transparent rounded-lg">
                  <div className="text-sm text-gray-600 mb-1 font-medium">Prerequisites:</div>
                  <div className="flex flex-wrap gap-1">
                    {course.prerequisites.map((prereq, idx) => (
                      <span key={idx} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Class */}
              {course.nextClass && (
                <div className="relative mb-6 p-3 bg-gradient-to-r from-secondary-50 to-transparent rounded-lg">
                  <div className="flex items-center text-sm text-secondary-600 mb-2 font-medium">
                    <Calendar className="h-4 w-4 mr-2" />
                    Next Class
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(course.nextClass).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
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
                    Join Class
                  </Link>
                ) : (
                  <Link
                    to={`/student/courses/${course._id || course.id}`}
                    className="flex-1 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:from-secondary-600 hover:to-secondary-700 transition-all duration-300 shadow-soft hover:shadow-medium hover:scale-105 text-center"
                  >
                    View Details
                  </Link>
                )}
                <button className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105 shadow-soft">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-gray-100">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">No enrolled courses found for the selected semester.</p>
          </div>
        )}

        {/* Quick Stats */}
        {!loading && !error && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stat-card group animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform inline-block">{courses.length}</p>
                </div>
              </div>
            </div>

            <div className="stat-card group animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center">
                <div className="p-3 bg-accent-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <FileText className="h-6 w-6 text-accent-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Pending Assignments</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform inline-block">
                    {courses.reduce((sum, course) => sum + (course.assignments || 0), 0)}
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
                    {courses.filter(course => course.is_virtual).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card group animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 font-medium">Total Credits</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform inline-block">
                    {courses.reduce((sum, course) => sum + (course.credits || 0), 0)}
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

export default StudentCourses;

