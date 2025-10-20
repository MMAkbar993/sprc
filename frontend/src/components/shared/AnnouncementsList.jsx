import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, TrendingUp, Users, Calendar } from 'lucide-react';
import { announcementsAPI } from '../../services/api';

const AnnouncementsList = ({ limit = 5 }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [limit]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementsAPI.getAll(limit);
      setAnnouncements(response.data?.announcements || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.message);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'from-red-50 to-red-100/50 border-red-500';
      case 'high': return 'from-orange-50 to-orange-100/50 border-orange-500';
      case 'normal': return 'from-blue-50 to-blue-100/50 border-blue-500';
      case 'low': return 'from-gray-50 to-gray-100/50 border-gray-500';
      default: return 'from-blue-50 to-blue-100/50 border-blue-500';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'high': return <TrendingUp className="h-5 w-5 text-orange-600" />;
      default: return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg animate-bounce-slow">
          <Bell className="h-5 w-5 text-primary-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-6">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No announcements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className={`bg-gradient-to-r ${getPriorityColor(announcement.priority)} border-l-4 p-4 rounded-lg hover:shadow-soft transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getPriorityIcon(announcement.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {announcement.title}
                  </p>
                  <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(announcement.createdAt)}</span>
                    </span>
                    {announcement.target_audience !== 'all' && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{announcement.target_audience}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsList;

