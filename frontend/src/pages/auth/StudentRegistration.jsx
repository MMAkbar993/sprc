import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Calendar,
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: '',
    address: '',
    nationality: 'Pakistani',
    religion: 'Islam',
    
    // Guardian Information
    guardianName: '',
    guardianPhone: '',
    guardianRelation: '',
    emergencyContact: '',
    
    // Academic Information
    studentId: '',
    department: '',
    program: '',
    batch: '',
    semester: '1',
    section: ''
  });

  // Fetch available courses based on semester
  useEffect(() => {
    const fetchCourses = async () => {
      if (formData.semester) {
        try {
          const response = await fetch(`http://localhost:5000/api/courses?semester=${formData.semester}`);
          const data = await response.json();
          if (data.success) {
            setAvailableCourses(data.data.courses);
          }
        } catch (err) {
          console.error('Error fetching courses:', err);
        }
      }
    };
    fetchCourses();
  }, [formData.semester]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // API call to register student
      const response = await fetch('http://localhost:5000/api/auth/register/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          courses: selectedCourses
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const departments = [
    'Information Technology',
    'Computer Science',
    'English',
    'Urdu',
    'Botany',
    'Zoology',
    'Business Administration'
  ];

  const programs = [
    'BS Information Technology',
    'BS Computer Science',
    'BS English',
    'BS Urdu',
    'BS Botany',
    'BS Zoology',
    'BBA',
    'B.Ed'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-primary-50 to-accent-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-8 text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your student account has been created. Please wait for admin approval before logging in.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-soft">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SPRC Portal</h1>
              <p className="text-sm text-gray-600">Student Registration</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gradient">Student Registration Form</h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete the form below to register as a student
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-gradient-to-r from-red-50 to-red-100/50 p-4 rounded-lg border border-red-200 shadow-soft animate-scale-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></div>
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10"
                    placeholder="Create password (min 6 characters)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="+92-3XX-XXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Complete address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-secondary-500 to-secondary-600 rounded-full mr-3"></div>
              Guardian/Parent Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Guardian Name *</label>
                <input
                  type="text"
                  name="guardianName"
                  required
                  value={formData.guardianName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Father/Mother name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Guardian Phone *</label>
                <input
                  type="tel"
                  name="guardianPhone"
                  required
                  value={formData.guardianPhone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+92-3XX-XXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Relation *</label>
                <select
                  name="guardianRelation"
                  required
                  value={formData.guardianRelation}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact *</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  required
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+92-3XX-XXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-accent-500 to-accent-600 rounded-full mr-3"></div>
              Academic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID *</label>
                <input
                  type="text"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., CS2021001"
                />
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Program *</label>
                <select
                  name="program"
                  required
                  value={formData.program}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select program</option>
                  {programs.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Batch *</label>
                <input
                  type="text"
                  name="batch"
                  required
                  value={formData.batch}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 2021-2025"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Semester *</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Section *</label>
                <input
                  type="text"
                  name="section"
                  required
                  value={formData.section}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., A"
                  maxLength="1"
                />
              </div>
            </div>
          </div>

          {/* Course Selection */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></div>
              Course Enrollment
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select the courses you want to enroll in for Semester {formData.semester}
              </p>
              
              {availableCourses.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  {formData.semester ? 'No courses available for the selected semester.' : 'Please select a semester to see available courses.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {availableCourses.map(course => (
                    <label
                      key={course._id}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course._id)}
                        onChange={() => handleCourseToggle(course._id)}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{course.code}</span>
                          <span className="text-xs text-gray-500">{course.credits} Credits</span>
                        </div>
                        <p className="text-sm text-gray-700">{course.name}</p>
                        {course.instructor_id && (
                          <p className="text-xs text-gray-500 mt-1">
                            Instructor: {course.instructor_id.name}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              {selectedCourses.length > 0 && (
                <p className="text-sm text-green-600 font-medium mt-3">
                  {selectedCourses.length} course(s) selected
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
              ) : (
                'Register Student'
              )}
            </button>
            <Link
              to="/"
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;

