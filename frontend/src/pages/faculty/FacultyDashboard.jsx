import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Calendar, 
  Clock,
  TrendingUp,
  Award,
  Bell,
  Video,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courseAPI } from '../../services/api';
import AnnouncementsList from '../../components/shared/AnnouncementsList';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch faculty courses
      const coursesResponse = await courseAPI.getAll();
      const allCourses = coursesResponse.data?.courses || [];
      
      // Filter courses assigned to this faculty
      const myCourses = user?.role === 'faculty' && user?._id
        ? allCourses.filter(course => course.instructor_id?._id === user._id || course.instructor_id === user._id)
        : [];

      // Calculate stats
      const totalStudents = myCourses.reduce((sum, course) => sum + (course.enrolledCount || 0), 0);
      
      setDashboardData({
        myCourses: myCourses.length,
        totalStudents,
        pendingAssignments: 0, // Can be fetched from assignments API
        classesToday: 0, // Can be calculated from schedule
        courses: myCourses,
        todayClasses: [], // Can be filtered from courses
        recentSubmissions: [] // Can be fetched from submissions API
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching faculty dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
      setDashboardData({
        myCourses: 0,
        totalStudents: 0,
        pendingAssignments: 0,
        classesToday: 0,
        courses: [],
        todayClasses: [],
        recentSubmissions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const quickStats = dashboardData ? [
    { label: 'My Courses', value: dashboardData.myCourses.toString(), icon: BookOpen, color: 'text-primary-600', bgColor: 'bg-primary-100' },
    { label: 'Total Students', value: dashboardData.totalStudents.toString(), icon: Users, color: 'text-secondary-600', bgColor: 'bg-secondary-100' },
    { label: 'Pending Assignments', value: dashboardData.pendingAssignments.toString(), icon: FileText, color: 'text-accent-600', bgColor: 'bg-accent-100' },
    { label: 'Classes Today', value: dashboardData.classesToday.toString(), icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-100' }
  ] : [];

  const todayClasses = dashboardData?.todayClasses || [];
  const recentSubmissions = dashboardData?.recentSubmissions || [];

  const quickActions = [
    { title: 'Mark Attendance', icon: Clock, link: '/faculty/mark-attendance', color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { title: 'Assignments', icon: FileText, link: '/faculty/assignments', color: 'bg-gradient-to-r from-primary-500 to-primary-600' },
    { title: 'Enter Grades', icon: Award, link: '/faculty/enter-grades', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { title: 'View Students', icon: Users, link: '/faculty/students', color: 'bg-gradient-to-r from-accent-500 to-accent-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Welcome Header */}
        <div className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-card p-8 mb-8 border border-gray-100 overflow-hidden animate-slide-down">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full -mr-32 -mt-32 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-100/30 rounded-full -ml-32 -mb-32 blur-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, <span className="text-gradient-primary">{user?.name || 'Faculty'}</span>!
              </h1>
              <p className="text-gray-600 text-lg">
                {user?.employeeId && <><span className="font-semibold">Employee ID:</span> <span className="font-semibold text-secondary-600">{user.employeeId}</span> | </>}
                <span className="font-semibold">Role:</span> <span className="font-semibold text-secondary-600 capitalize">{user?.role || 'Faculty'}</span>
              </p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-500 mb-1">Today's Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div 
              key={index} 
              className="stat-card group animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform inline-block">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></div>
                Quick Actions
              </h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className={`${action.color} text-white rounded-xl p-4 flex items-center space-x-3 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 group animate-slide-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <action.icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{action.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <AnnouncementsList limit={5} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-secondary-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
              </div>
              <div className="space-y-4">
                {todayClasses.length > 0 ? (
                  todayClasses.map((class_, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-secondary-200 group"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-secondary-600 transition-colors">{class_.course}</h3>
                        <p className="text-sm text-gray-600">{class_.time}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-semibold text-secondary-600">{class_.room}</p>
                        <p className="text-sm text-gray-600">{class_.students} students</p>
                      </div>
                      {class_.isVirtual && (
                        <Link 
                          to={`/classroom/${class_.courseId}`}
                          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-soft hover:shadow-medium hover:scale-105"
                        >
                          Start Class
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No classes scheduled for today</p>
                    <Link to="/faculty/courses" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                      View all courses
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <FileText className="h-5 w-5 text-accent-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
              </div>
              <div className="space-y-4">
                {recentSubmissions.length > 0 ? (
                  recentSubmissions.map((submission, index) => (
                    <div 
                      key={index} 
                      className="flex items-start justify-between p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:-translate-x-1 cursor-pointer group border border-transparent hover:border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{submission.student}</h4>
                          {submission.status === 'new' && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">New</span>
                          )}
                          {submission.status === 'graded' && (
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">Graded</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{submission.assignment}</p>
                        <p className="text-xs text-gray-500 mt-1">{submission.course} • {submission.time}</p>
                      </div>
                      {submission.status === 'new' && (
                        <Link to="/faculty/assignments" className="ml-4 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                          Grade Now
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent submissions</p>
                    <Link to="/faculty/assignments" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
                      View all assignments
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

