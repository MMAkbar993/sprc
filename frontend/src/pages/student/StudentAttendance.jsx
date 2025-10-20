import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  BookOpen
} from 'lucide-react';

const StudentAttendance = () => {
  const [summary, setSummary] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendanceSummary();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAttendanceDetails();
    }
  }, [selectedCourse]);

  const fetchAttendanceSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/attendance/my-attendance/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSummary(data.data.summary);
      } else {
        setError(data.message || 'Failed to load attendance summary');
      }
    } catch (err) {
      console.error('Error fetching attendance summary:', err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedCourse === 'all'
        ? 'http://localhost:5000/api/attendance/my-attendance'
        : `http://localhost:5000/api/attendance/my-attendance?course_id=${selectedCourse}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAttendanceDetails(data.data.attendance);
      }
    } catch (err) {
      console.error('Error fetching attendance details:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-300';
      case 'absent': return 'bg-red-100 text-red-800 border-red-300';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-5 w-5" />;
      case 'absent': return <XCircle className="h-5 w-5" />;
      case 'late': return <Clock className="h-5 w-5" />;
      case 'excused': return <FileText className="h-5 w-5" />;
      default: return null;
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const overallAttendance = summary.length > 0
    ? (summary.reduce((sum, course) => sum + course.percentage, 0) / summary.length).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 text-primary-600 mr-3" />
            My Attendance
          </h1>
          <p className="text-gray-600 mt-2">Track your attendance across all courses</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading attendance data...</p>
          </div>
        ) : (
          <>
            {/* Overall Statistics */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-card p-8 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 mb-2">Overall Attendance</p>
                  <p className="text-5xl font-bold">{overallAttendance}%</p>
                  <p className="text-primary-100 mt-2">
                    {overallAttendance >= 75 ? '✓ Meeting requirement' : '⚠ Below requirement (75%)'}
                  </p>
                </div>
                <TrendingUp className="h-24 w-24 text-primary-200" />
              </div>
            </div>

            {/* Course-wise Summary */}
            <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Course-wise Attendance</h2>
              
              {summary.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No attendance records yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {summary.map((course) => (
                    <div
                      key={course.course._id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setSelectedCourse(course.course._id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-gray-900">{course.course.code}</p>
                          <p className="text-sm text-gray-600">{course.course.name}</p>
                        </div>
                        <BookOpen className="h-6 w-6 text-primary-500" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Classes</span>
                          <span className="font-semibold text-gray-900">{course.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Present</span>
                          <span className="font-semibold text-green-600">{course.present}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Absent</span>
                          <span className="font-semibold text-red-600">{course.absent}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Attendance</span>
                          <span className={`text-2xl font-bold ${getPercentageColor(course.percentage)}`}>
                            {course.percentage}%
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              course.percentage >= 75 ? 'bg-green-500' :
                              course.percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(course.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Attendance Records */}
            {attendanceDetails.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Attendance History</h2>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="input-field max-w-xs"
                  >
                    <option value="all">All Courses</option>
                    {summary.map((course) => (
                      <option key={course.course._id} value={course.course._id}>
                        {course.course.code} - {course.course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceDetails.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{record.course_id.code}</div>
                            <div className="text-sm text-gray-500">{record.course_id.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                              {getStatusIcon(record.status)}
                              <span className="capitalize">{record.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {record.session_type}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {record.remarks || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Attendance Requirements Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Attendance Requirements</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Minimum 75% attendance is required to appear in final exams</li>
                    <li>• Between 65-75% requires special permission from the department</li>
                    <li>• Below 65% may result in course repeat</li>
                    <li>• Medical certificates must be submitted within 3 days for excused absences</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;

