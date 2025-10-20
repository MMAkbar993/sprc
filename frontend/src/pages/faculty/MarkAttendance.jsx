import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Save,
  AlertCircle,
  CheckCheck
} from 'lucide-react';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [sessionType, setSessionType] = useState('lecture');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchStudents();
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data.courses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/attendance/course/${selectedCourse}/students?date=${selectedDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        // Initialize students with their existing attendance or default to absent
        const studentsWithStatus = data.data.students.map(student => ({
          ...student,
          status: student.attendance?.status || 'absent',
          remarks: student.attendance?.remarks || ''
        }));
        setStudents(studentsWithStatus);
      } else {
        setError(data.message || 'Failed to load students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStudents(prev =>
      prev.map(student =>
        student._id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents(prev =>
      prev.map(student =>
        student._id === studentId ? { ...student, remarks } : student
      )
    );
  };

  const markAllPresent = () => {
    setStudents(prev =>
      prev.map(student => ({ ...student, status: 'present' }))
    );
  };

  const markAllAbsent = () => {
    setStudents(prev =>
      prev.map(student => ({ ...student, status: 'absent' }))
    );
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !selectedDate) {
      setError('Please select course and date');
      return;
    }

    if (students.length === 0) {
      setError('No students to mark attendance');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const attendanceData = {
        course_id: selectedCourse,
        date: selectedDate,
        session_type: sessionType,
        students: students.map(student => ({
          student_id: student._id,
          status: student.status,
          remarks: student.remarks
        }))
      };

      const response = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(attendanceData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Attendance marked successfully for ${data.data.marked} students!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
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

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 text-primary-600 mr-3" />
            Mark Attendance
          </h1>
          <p className="text-gray-600 mt-2">Mark attendance for your students</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Course *
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="input-field"
              >
                <option value="lecture">Lecture</option>
                <option value="lab">Lab</option>
                <option value="tutorial">Tutorial</option>
                <option value="virtual">Virtual Class</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-soft p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-green-50 rounded-xl shadow-soft p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Present</p>
                  <p className="text-2xl font-bold text-green-900">{presentCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-red-50 rounded-xl shadow-soft p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Absent</p>
                  <p className="text-2xl font-bold text-red-900">{absentCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl shadow-soft p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Attendance %</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {students.length > 0 ? ((presentCount / students.length) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <CheckCheck className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {students.length > 0 && (
          <div className="bg-white rounded-xl shadow-soft p-4 mb-6 border border-gray-100">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={markAllPresent}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark All Present</span>
              </button>
              <button
                onClick={markAllAbsent}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Mark All Absent</span>
              </button>
            </div>
          </div>
        )}

        {/* Students List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading students...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Student List</h2>
              
              <div className="space-y-3">
                {students.map((student, index) => (
                  <div
                    key={student._id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.student_id}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {['present', 'absent', 'late', 'excused'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student._id, status)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${
                              student.status === status
                                ? getStatusColor(status) + ' border-2'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                            }`}
                          >
                            {getStatusIcon(status)}
                            <span className="capitalize">{status}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Add remarks (optional)"
                        value={student.remarks}
                        onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={saving || students.length === 0}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Attendance</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate('/faculty')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : selectedCourse && !loading ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students enrolled in this course</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select a course and date to view students</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;

