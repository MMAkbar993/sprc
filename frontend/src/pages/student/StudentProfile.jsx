import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar, BookOpen, Edit2, Save, X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    guardianName: '',
    bloodGroup: '',
    nationality: '',
    religion: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      const userData = response.data?.user || response.data;
      
      setProfileData(userData);
      
      const formattedData = {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        dateOfBirth: userData.date_of_birth ? new Date(userData.date_of_birth).toISOString().split('T')[0] : '',
        emergencyContact: userData.emergency_contact || '',
        guardianName: userData.guardian_name || '',
        bloodGroup: userData.blood_group || '',
        nationality: userData.nationality || '',
        religion: userData.religion || ''
      };
      
      setFormData(formattedData);
      setOriginalData(formattedData);
      setError('');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const response = await authAPI.updateProfile(formData);
      
      setSuccess('Profile updated successfully!');
      setOriginalData(formData);
      setIsEditing(false);
      
      // Update user context
      if (setUser) {
        setUser(prev => ({
          ...prev,
          ...response.data?.user
        }));
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const academicInfo = profileData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200 animate-fade-in">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-soft">
                  {user?.name?.charAt(0)}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 bg-accent-500 text-white p-2 rounded-full shadow-soft hover:bg-accent-600 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-lg text-gray-600">Student ID: {user?.studentId}</p>
                <p className="text-gray-500">{user?.department}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-soft flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white px-6 py-2 rounded-lg font-medium hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-soft flex items-center space-x-2"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg mr-3">
                <Mail className="h-5 w-5 text-primary-600" />
              </div>
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.dateOfBirth}</p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg mr-3">
                <BookOpen className="h-5 w-5 text-secondary-600" />
              </div>
              Academic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <p className="text-gray-900 font-mono">{academicInfo.student_id || academicInfo.studentId || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                <p className="text-gray-900">{academicInfo.program || 'BS Information Technology'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <p className="text-gray-900">{academicInfo.department || academicInfo.department_id?.name || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                <p className="text-gray-900">{academicInfo.semester ? `${academicInfo.semester} Semester` : 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <p className="text-gray-900">{academicInfo.batch || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <p className="text-gray-900">{academicInfo.section || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-accent-100 rounded-lg mr-3">
                <Phone className="h-5 w-5 text-accent-600" />
              </div>
              Emergency Contact
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.guardianName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.emergencyContact}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              Additional Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                {isEditing ? (
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.bloodGroup}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.nationality}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.religion}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

