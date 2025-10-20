import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    priority: 'normal'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnnouncements();
      setAnnouncements(response.data?.announcements || []);
      setError('');
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (editingAnnouncement) {
        await adminAPI.updateAnnouncement(editingAnnouncement._id, formData);
        setSuccess('Announcement updated successfully!');
      } else {
        await adminAPI.createAnnouncement(formData);
        setSuccess('Announcement created successfully!');
      }
      
      fetchAnnouncements();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Save announcement error:', err);
      setError(err.message || 'Failed to save announcement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target_audience: announcement.target_audience,
      priority: announcement.priority
    });
    setShowForm(true);
  };

  const handleDelete = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await adminAPI.deleteAnnouncement(announcementId);
      setSuccess('Announcement deleted successfully!');
      fetchAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete announcement error:', err);
      setError(err.message || 'Failed to delete announcement. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      target_audience: 'all',
      priority: 'normal'
    });
    setEditingAnnouncement(null);
    setShowForm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAudienceIcon = (audience) => {
    switch (audience) {
      case 'students': return <Users className="h-4 w-4" />;
      case 'faculty': return <TrendingUp className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="h-8 w-8 text-primary-600 mr-3" />
                Manage Announcements
              </h1>
              <p className="text-gray-600 mt-2">Create and manage announcements for students and faculty</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center space-x-2"
            >
              {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              <span>{showForm ? 'Cancel' : 'New Announcement'}</span>
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

        {/* Announcement Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  required
                  value={formData.content}
                  onChange={handleChange}
                  className="input-field"
                  rows="6"
                  placeholder="Enter announcement content..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <select
                    name="target_audience"
                    required
                    value={formData.target_audience}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="all">All (Students & Faculty)</option>
                    <option value="students">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    name="priority"
                    required
                    value={formData.priority}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>{editingAnnouncement ? 'Update' : 'Create'} Announcement</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements List */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">All Announcements</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading announcements...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No announcements yet. Create your first announcement!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                            <span className="capitalize">{announcement.priority}</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                            {getAudienceIcon(announcement.target_audience)}
                            <span className="capitalize">{announcement.target_audience}</span>
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{announcement.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>By: {announcement.author_id?.name || 'Admin'}</span>
                          <span>•</span>
                          <span>{formatDate(announcement.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(announcement)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(announcement._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAnnouncements;

