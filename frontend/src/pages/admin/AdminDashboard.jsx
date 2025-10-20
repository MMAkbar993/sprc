import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Bell,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  UserCheck,
  UserX,
  AlertCircle,
  Link as LinkIcon,
  Copy,
  CheckCircle,
  Loader
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = window.location.origin;
  const registrationLinks = {
    student: `${baseUrl}/register/student`,
    faculty: `${baseUrl}/register/faculty`
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  const stats = dashboardData ? [
    { label: 'Total Students', value: dashboardData.totalStudents?.toString() || '0', change: dashboardData.newStudents ? `+${dashboardData.newStudents}` : '+0', icon: Users, color: 'text-primary-600 bg-primary-100' },
    { label: 'Active Courses', value: dashboardData.activeCourses?.toString() || '0', change: dashboardData.newCourses ? `+${dashboardData.newCourses}` : '+0', icon: BookOpen, color: 'text-secondary-600 bg-secondary-100' },
    { label: 'Faculty Members', value: dashboardData.totalFaculty?.toString() || '0', change: dashboardData.newFaculty ? `+${dashboardData.newFaculty}` : '+0', icon: GraduationCap, color: 'text-accent-600 bg-accent-100' },
    { label: 'Virtual Classes', value: dashboardData.virtualClasses?.toString() || '0', change: dashboardData.newVirtualClasses ? `+${dashboardData.newVirtualClasses}` : '+0', icon: TrendingUp, color: 'text-purple-600 bg-purple-100' }
  ] : [];

  const recentActivities = dashboardData?.recentActivities || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  const quickActions = [
    { title: 'Manage Courses', icon: BookOpen, link: '/admin/courses', color: 'bg-gradient-to-r from-primary-500 to-primary-600' },
    { title: 'Manage Students', icon: Users, link: '/admin/students', color: 'bg-gradient-to-r from-accent-500 to-accent-600' },
    { title: 'Manage Faculty', icon: GraduationCap, link: '/admin/faculty', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { title: 'Announcements', icon: Bell, link: '/admin/announcements', color: 'bg-gradient-to-r from-secondary-500 to-secondary-600' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'courses', name: 'Courses', icon: BookOpen },
    { id: 'faculty', name: 'Faculty', icon: GraduationCap },
    { id: 'reports', name: 'Reports', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin <span className="text-primary-600">Dashboard</span></h1>
              <p className="text-gray-600 mt-1">Manage your college administration</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="h-8 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft mb-8 border border-gray-100">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
                  {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => {
                        // Get icon and color based on activity type
                        const getActivityIcon = (type) => {
                          switch(type) {
                            case 'student': return { icon: UserCheck, color: 'text-green-600' };
                            case 'course': return { icon: BookOpen, color: 'text-primary-600' };
                            case 'alert': return { icon: AlertCircle, color: 'text-yellow-600' };
                            case 'user': return { icon: Users, color: 'text-purple-600' };
                            default: return { icon: Bell, color: 'text-blue-600' };
                          }
                        };
                        
                        const { icon: ActivityIcon, color } = getActivityIcon(activity.type);
                        const bgColor = color.replace('text-', 'bg-').replace('-600', '-100');
                        
                        return (
                          <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                            <div className={`p-2 rounded-lg ${bgColor}`}>
                              <ActivityIcon className={`h-4 w-4 ${color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{activity.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {activity.time ? new Date(activity.time).toLocaleString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No recent activities</p>
                    </div>
                  )}
                </div>

                {/* Upcoming Events */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Events</h3>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                          <p className="text-xs text-gray-500">{event.time}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No upcoming events</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'students' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Management</h3>
                <p className="text-gray-600 mb-4">View and manage all students in the system.</p>
                <Link
                  to="/admin/students"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium"
                >
                  <Users className="h-5 w-5" />
                  <span>Manage Students</span>
                </Link>
              </div>
            )}

            {selectedTab === 'courses' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Management</h3>
                <p className="text-gray-600 mb-4">Create and manage courses, assign instructors, and track enrollments.</p>
                <Link
                  to="/admin/courses"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Manage Courses</span>
                </Link>
              </div>
            )}

            {selectedTab === 'faculty' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Faculty Management</h3>
                <p className="text-gray-600 mb-4">View and manage all faculty members in the system.</p>
                <Link
                  to="/admin/faculty"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium"
                >
                  <GraduationCap className="h-5 w-5" />
                  <span>Manage Faculty</span>
                </Link>
              </div>
            )}

            {selectedTab === 'reports' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Reports & Analytics</h3>
                <p className="text-gray-600">Reports and analytics features will be implemented here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Registration Links */}
        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></div>
            Registration Links
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Share these links with students and faculty to allow them to register in the portal
          </p>
          
          <div className="space-y-4">
            {/* Student Registration Link */}
            <div className="bg-gradient-to-r from-primary-50 to-white p-4 rounded-xl border border-primary-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">Student Registration Link</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(registrationLinks.student, 'student')}
                  className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  {copiedLink === 'student' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
              <code className="text-xs text-gray-600 bg-white px-3 py-2 rounded-lg block overflow-x-auto">
                {registrationLinks.student}
              </code>
            </div>

            {/* Faculty Registration Link */}
            <div className="bg-gradient-to-r from-secondary-50 to-white p-4 rounded-xl border border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-secondary-600" />
                  <h4 className="font-semibold text-gray-900">Faculty Registration Link</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(registrationLinks.faculty, 'faculty')}
                  className="flex items-center space-x-2 bg-secondary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-600 transition-colors"
                >
                  {copiedLink === 'faculty' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
              <code className="text-xs text-gray-600 bg-white px-3 py-2 rounded-lg block overflow-x-auto">
                {registrationLinks.faculty}
              </code>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} text-white p-4 rounded-xl hover:shadow-medium transition-all duration-200 transform hover:-translate-y-1`}
              >
                <div className="flex items-center space-x-3">
                  <action.icon className="h-6 w-6" />
                  <span className="font-medium">{action.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

