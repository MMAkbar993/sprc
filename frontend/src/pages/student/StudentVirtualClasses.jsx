import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Play,
  AlertCircle,
  BookOpen,
  User
} from 'lucide-react';

const StudentVirtualClasses = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/virtualclass/student/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSessions(data.data.sessions);
      } else {
        setError(data.message || 'Failed to load sessions');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load virtual classes');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (session) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/virtualclass/${session._id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      navigate(`/classroom/${session.room_id}`);
    } catch (err) {
      console.error('Error joining class:', err);
      setError('Failed to join class');
    }
  };

  const getStatusBadge = (session) => {
    if (session.status === 'ongoing') {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300 animate-pulse">● Live Now</span>;
    }
    
    const now = new Date();
    const scheduledTime = new Date(session.scheduled_date);
    const timeDiff = (scheduledTime - now) / (1000 * 60); // minutes
    
    if (timeDiff <= 0 && timeDiff > -session.duration) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">Starting Soon</span>;
    }
    
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">Upcoming</span>;
  };

  const canJoinSession = (session) => {
    const now = new Date();
    const scheduledTime = new Date(session.scheduled_date);
    const endTime = new Date(scheduledTime.getTime() + session.duration * 60000);
    
    // Can join 10 minutes before and during the session
    return (scheduledTime - now) <= 10 * 60 * 1000 && now <= endTime;
  };

  const getTimeUntilClass = (scheduledDate) => {
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diff = scheduled - now;
    
    if (diff < 0) return 'Started';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `In ${days} day${days > 1 ? 's' : ''}`;
    }
    if (hours > 0) {
      return `In ${hours}h ${minutes}m`;
    }
    return `In ${minutes} minutes`;
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

  const liveSessions = sessions.filter(s => s.status === 'ongoing');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Video className="h-8 w-8 text-primary-600 mr-3" />
            Virtual Classes
          </h1>
          <p className="text-gray-600 mt-2">Join your scheduled virtual classroom sessions</p>
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
            <p className="text-gray-600 mt-4">Loading virtual classes...</p>
          </div>
        ) : (
          <>
            {/* Live Now Section */}
            {liveSessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  Live Now
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {liveSessions.map((session) => (
                    <div
                      key={session._id}
                      className="bg-gradient-to-r from-green-50 to-white rounded-2xl shadow-card p-6 border-2 border-green-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white animate-pulse">
                              ● LIVE
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {session.course_id.code} - {session.course_id.name}
                          </p>
                          <p className="text-sm text-gray-700">
                            Instructor: {session.instructor_id.name}
                          </p>
                          {session.description && (
                            <p className="text-gray-600 mt-2">{session.description}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinClass(session)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 animate-pulse-slow"
                      >
                        <Play className="h-6 w-6" />
                        <span>Join Class Now</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Classes</h2>
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
                          <p className="text-sm text-gray-600 flex items-center space-x-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{session.course_id.code} - {session.course_id.name}</span>
                          </p>
                          <p className="text-sm text-gray-600 flex items-center space-x-2 mt-1">
                            <User className="h-4 w-4" />
                            <span>Instructor: {session.instructor_id.name}</span>
                          </p>
                          {session.description && (
                            <p className="text-gray-700 mt-2">{session.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Starts in</p>
                          <p className="text-lg font-bold text-primary-600">
                            {getTimeUntilClass(session.scheduled_date)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(session.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Duration: {session.duration} minutes</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinClass(session)}
                        disabled={!canJoinSession(session)}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                          canJoinSession(session)
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-soft hover:shadow-medium'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Play className="h-5 w-5" />
                        <span>{canJoinSession(session) ? 'Join Class' : 'Not Yet Available'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {sessions.length === 0 && !loading && (
              <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No virtual classes scheduled</p>
                <p className="text-sm text-gray-500 mt-2">Your instructor will schedule classes soon</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentVirtualClasses;
