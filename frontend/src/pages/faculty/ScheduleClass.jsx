import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Calendar, 
  Clock,
  Users,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ScheduleClass = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '90',
    semester: '1',
    department: '',
    section: '',
    maxParticipants: '100'
  });

  // Sample courses (in real app, fetch from API)
  const courses = [
    { id: '1', name: 'Web Development', code: 'CS401' },
    { id: '2', name: 'Database Systems', code: 'CS402' },
    { id: '3', name: 'Software Engineering', code: 'CS403' },
    { id: '4', name: 'Computer Networks', code: 'CS404' }
  ];

  const departments = [
    'Information Technology',
    'Computer Science',
    'English',
    'Urdu',
    'Botany',
    'Zoology',
    'Business Administration'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const response = await fetch('http://localhost:5000/api/classroom/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          scheduledDateTime: scheduledDateTime.toISOString(),
          instructorId: user?._id || 'temp-id'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/faculty/virtual-classes');
        }, 2000);
      } else {
        setError(data.message || 'Failed to schedule class');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNow = () => {
    // Generate room ID and start class immediately
    const roomId = `SPRC_${Date.now()}`;
    navigate(`/classroom/${roomId}?semester=${formData.semester}&department=${formData.department}`);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-8 text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Class Scheduled Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your virtual class has been scheduled. Students from the selected semester can now see and join this class.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to virtual classes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-card p-8 mb-8 border border-gray-100 overflow-hidden animate-slide-down">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full -mr-32 -mt-32 blur-2xl"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Schedule <span className="text-gradient-primary">Virtual Class</span>
            </h1>
            <p className="text-gray-600">Create and schedule a virtual classroom session for your students</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-gradient-to-r from-red-50 to-red-100/50 p-4 rounded-lg border border-red-200 shadow-soft animate-scale-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Details */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></div>
              Class Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course *</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="courseId"
                    required
                    value={formData.courseId}
                    onChange={handleChange}
                    className="input-field pl-10"
                  >
                    <option value="">Select course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Introduction to HTML & CSS"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="Brief description of what will be covered in this class..."
                />
              </div>
            </div>
          </div>

          {/* Schedule & Audience */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-secondary-500 to-secondary-600 rounded-full mr-3"></div>
              Schedule & Target Audience
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="scheduledDate"
                    required
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    name="scheduledTime"
                    required
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes) *</label>
                <select
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="150">2.5 hours</option>
                  <option value="180">3 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Participants</label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="10"
                  max="500"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Semester *</label>
                <select
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleChange}
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                <select
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Section (Optional)</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  maxLength="1"
                  className="input-field"
                  placeholder="e.g., A, B, C (Leave empty for all sections)"
                />
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-6 animate-scale-in">
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Who can join this class?</h4>
                <p className="text-sm text-blue-800">
                  Only students from <strong>Semester {formData.semester}</strong> in 
                  <strong> {formData.department || '(selected department)'}</strong>
                  {formData.section && <span> Section <strong>{formData.section}</strong></span>}
                  {!formData.section && <span> (all sections)</span>}
                  {' '}will be able to see and join this virtual class.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <Calendar className="h-5 w-5" />
                  <span>Schedule Class</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleStartNow}
              className="flex-1 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-secondary-600 hover:to-secondary-700 transition-all duration-300 shadow-soft hover:shadow-medium hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Video className="h-5 w-5" />
              <span>Start Now</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/faculty')}
            className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleClass;

