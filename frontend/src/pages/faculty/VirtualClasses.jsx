import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Play,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const VirtualClasses = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    scheduled_date: '',
    duration: '60'
  });

  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, []);

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
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/virtualclass/my-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSessions(data.data.sessions);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/virtualclass/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Virtual class session created successfully!');
        setShowForm(false);
        setFormData({
          course_id: '',
          title: '',
          description: '',
          scheduled_date: '',
          duration: '60'
        });
        fetchSessions();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to create session');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartClass = async (session) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/virtualclass/${session._id}/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Join the session
      await fetch(`http://localhost:5000/api/virtualclass/${session._id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      navigate(`/classroom/${session.room_id}`);
    } catch (err) {
      console.error('Error starting class:', err);
      setError('Failed to start class');
    }
  };

  const getStatusBadge = (session) => {
    const now = new Date();
    const scheduledTime = new Date(session.scheduled_date);
    
    if (session.status === 'completed') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Completed</span>;
    }
    if (session.status === 'cancelled') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
    }
    if (session.status === 'ongoing') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">● Live Now</span>;
    }
    if (scheduledTime <= now) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Ready to Start</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Upcoming</span>;
  };

  const canStartSession = (session) => {
    const now = new Date();
    const scheduledTime = new Date(session.scheduled_date);
    const timeDiff = (scheduledTime - now) / (1000 * 60); // minutes
    
    return timeDiff <= 15 && session.status !== 'completed' && session.status !== 'cancelled';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingSessions = sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled');
  const pastSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Video className="h-8 w-8 text-primary-600 mr-3" />
                Virtual Classes
              </h1>
              <p className="text-gray-600 mt-2">Schedule and manage your virtual classroom sessions</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center space-x-2"
            >
              {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              <span>{showForm ? 'Cancel' : 'Schedule Class'}</span>
            </button>
          </div>
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

        {/* Create Session Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Schedule New Virtual Class</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course *
                  </label>
                  <select
                    required
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Introduction to React Hooks"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Class agenda and topics..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <select
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Schedule Class</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming & Active Sessions</h2>
            <div className="grid grid-cols-1 gap-6">
              {upcomingSessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                        {getStatusBadge(session)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {session.course_id.code} - {session.course_id.name}
                      </p>
                      {session.description && (
                        <p className="text-gray-700 mt-2">{session.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{formatDate(session.scheduled_date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{session.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{session.participants?.length || 0} joined</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    {canStartSession(session) ? (
                      <button
                        onClick={() => handleStartClass(session)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2"
                      >
                        <Play className="h-5 w-5" />
                        <span>{session.status === 'ongoing' ? 'Join Class' : 'Start Class'}</span>
                      </button>
                    ) : (
                      <div className="flex-1 bg-gray-100 text-gray-500 py-3 px-4 rounded-lg font-medium text-center">
                        Available 15 minutes before scheduled time
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Sessions</h2>
            <div className="grid grid-cols-1 gap-4">
              {pastSessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white rounded-xl shadow-soft p-4 border border-gray-100 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{session.title}</h3>
                      <p className="text-sm text-gray-600">
                        {session.course_id.code} • {formatDate(session.scheduled_date)}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && sessions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No virtual classes scheduled yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              Schedule Your First Class
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualClasses;
