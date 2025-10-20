import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Award,
  Download,
  Plus,
  X,
  Save,
  AlertCircle
} from 'lucide-react';

const FacultyAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    type: 'assignment',
    total_marks: '100',
    due_date: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      fetchAssignments();
    }
  }, [courses, selectedCourse]);

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

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch assignments for each course
      const allAssignments = [];
      for (const course of courses) {
        const response = await fetch(`http://localhost:5000/api/assignments/course/${course._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          allAssignments.push(...data.data.assignments.map(a => ({
            ...a,
            course: course
          })));
        }
      }

      setAssignments(allAssignments);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments');
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
      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Assignment created successfully!');
        setShowForm(false);
        setFormData({
          course_id: '',
          title: '',
          description: '',
          type: 'assignment',
          total_marks: '100',
          due_date: ''
        });
        fetchAssignments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to create assignment');
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = selectedCourse === 'all'
    ? assignments 
    : assignments.filter(a => a.course._id === selectedCourse);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="h-8 w-8 text-primary-600 mr-3" />
                Assignments & Grading
              </h1>
              <p className="text-gray-600 mt-2">Create assignments and grade submissions</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center space-x-2"
            >
              {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              <span>{showForm ? 'Cancel' : 'Create Assignment'}</span>
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

        {/* Create Assignment Form */}
        {showForm && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Assignment</h2>
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
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., HTML/CSS Project"
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
                    placeholder="Assignment description and instructions..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="project">Project</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="input-field"
                  />
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
                      <span>Create Assignment</span>
                    </>
                  )}
            </button>
              </div>
            </form>
          </div>
        )}

        {/* Course Filter */}
        <div className="bg-white rounded-xl shadow-soft p-4 mb-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-semibold text-gray-700">Filter by Course:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignments List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No assignments yet. Create your first assignment!</p>
          </div>
        ) : (
        <div className="space-y-6">
          {filteredAssignments.map((assignment, index) => (
            <div 
                key={assignment._id} 
                className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {assignment.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                      {assignment.course.code} - {assignment.course.name}
                  </p>
                    {assignment.description && (
                      <p className="text-gray-700 mt-2">{assignment.description}</p>
                    )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Due Date</p>
                  <div className="flex items-center space-x-2 text-secondary-600">
                    <Calendar className="h-4 w-4" />
                      <span className="font-semibold">{formatDate(assignment.due_date)}</span>
                    </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Total Marks</p>
                    <p className="text-lg font-bold text-gray-900">{assignment.total_marks}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Submissions</p>
                    <p className="text-lg font-bold text-blue-900">{assignment.totalSubmissions || 0}</p>
                </div>

                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-yellow-700 mb-1">Pending</p>
                    <p className="text-lg font-bold text-yellow-900">
                      {(assignment.totalSubmissions || 0) - (assignment.gradedSubmissions || 0)}
                    </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-700 mb-1">Graded</p>
                    <p className="text-lg font-bold text-green-900">{assignment.gradedSubmissions || 0}</p>
                </div>
              </div>

              {/* Progress Bar */}
                {assignment.totalSubmissions > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Grading Progress</span>
                  <span className="text-primary-600 font-semibold">
                        {Math.round(((assignment.gradedSubmissions || 0) / assignment.totalSubmissions) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${((assignment.gradedSubmissions || 0) / assignment.totalSubmissions) * 100}%` }}
                  ></div>
                </div>
              </div>
                )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/faculty/grade-submissions?assignment=${assignment._id}`)}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center justify-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Submissions ({assignment.totalSubmissions || 0})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default FacultyAssignments;

