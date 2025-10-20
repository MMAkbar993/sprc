import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Award, 
  Video, 
  Bell, 
  Clock,
  Users,
  FileText,
  TrendingUp,
  Loader
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI } from '../../services/api';
import AnnouncementsList from '../../components/shared/AnnouncementsList';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Use real data if available, otherwise use defaults
  const quickStats = dashboardData ? [
    { 
      label: 'Enrolled Courses', 
      value: dashboardData.enrolledCourses?.toString() || '0', 
      icon: BookOpen, 
      color: 'text-primary-600', 
      bgColor: 'bg-primary-100' 
    },
    { 
      label: 'Current CGPA', 
      value: dashboardData.cgpa ? (typeof dashboardData.cgpa === 'number' ? dashboardData.cgpa.toFixed(2) : dashboardData.cgpa) : 'N/A', 
      icon: Award, 
      color: 'text-accent-600', 
      bgColor: 'bg-accent-100' 
    },
    { 
      label: 'Attendance', 
      value: dashboardData.attendancePercentage ? `${dashboardData.attendancePercentage}%` : 'N/A', 
      icon: Clock, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100' 
    },
    { 
      label: 'Assignments Due', 
      value: dashboardData.pendingAssignments?.toString() || '0', 
      icon: FileText, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100', 
      link: '/student/assignments' 
    }
  ] : [];

  const upcomingClasses = dashboardData?.upcomingClasses || [];
  const recentActivities = dashboardData?.recentActivities || [];

  const quickActions = [
    { title: 'My Assignments', icon: FileText, link: '/student/assignments', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { title: 'Virtual Classes', icon: Video, link: '/student/virtual-classes', color: 'bg-gradient-to-r from-primary-500 to-primary-600' },
    { title: 'My Attendance', icon: Clock, link: '/student/attendance', color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { title: 'Check Grades', icon: Award, link: '/student/grades', color: 'bg-gradient-to-r from-accent-500 to-accent-600' }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-card p-8 max-w-md text-center border border-gray-100">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-card p-8 mb-8 border border-gray-100 overflow-hidden animate-slide-down">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full -mr-32 -mt-32 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-100/30 rounded-full -ml-32 -mb-32 blur-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, <span className="text-gradient-primary">{user?.name}</span>!
              </h1>
              <p className="text-gray-600 text-lg">
                Student ID: <span className="font-semibold text-secondary-600">{user?.studentId}</span> | 
                Department: <span className="font-semibold text-secondary-600">{user?.department}</span>
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
                <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              </div>
              <div className="space-y-4">
                {upcomingClasses.length > 0 ? (
                  upcomingClasses.map((class_, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-secondary-200 group"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-secondary-600 transition-colors">{class_.courseName || class_.subject}</h3>
                        <p className="text-sm text-gray-600">{class_.instructorName || class_.instructor || 'TBA'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary-600">{class_.time}</p>
                        <p className="text-sm text-gray-600">{class_.room || 'Room TBA'}</p>
                      </div>
                      {(class_.isVirtual || (class_.room && class_.room.includes('Virtual'))) && (
                        <Link 
                          to={`/classroom/${class_.courseId || class_.id}`}
                          className="ml-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-soft hover:shadow-medium hover:scale-105"
                        >
                          Join
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No classes scheduled for today</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-accent-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              </div>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-300 hover:-translate-x-1 cursor-pointer group"
                    >
                      <div className={`w-3 h-3 rounded-full mt-2 group-hover:scale-125 transition-transform ${
                        activity.type === 'assignment' ? 'bg-primary-500' :
                        activity.type === 'grade' ? 'bg-accent-500' : 'bg-secondary-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium group-hover:text-gray-700">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activities</p>
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

export default StudentDashboard;
