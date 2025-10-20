import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courseAPI, adminAPI } from '../../services/api';

const ManageCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    semester: '',
    department: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: '3',
    semester: '1',
    department_id: '',
    instructor_id: '',
    is_virtual: false,
    schedule: {
      days: [],
      time: '',
      room: ''
    }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchFacultyList();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAll();
      const coursesData = response.data?.courses || response.data || [];
      setCourses(coursesData);
      setFilteredCourses(coursesData);
      setError('');
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      // This would need to be added to the API service, for now use direct fetch
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/departments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data?.departments || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchFacultyList = async () => {
    try {
      const response = await adminAPI.getFaculty();
      setFacultyList(response.data?.faculty || []);
    } catch (err) {
      console.error('Error fetching faculty:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    if (filters.semester) {
      filtered = filtered.filter(course => course.semester.toString() === filters.semester);
    }

    if (filters.department) {
      filtered = filtered.filter(course => 
        course.department_id?._id === filters.department ||
        course.department_id === filters.department
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(course =>
        course.code.toLowerCase().includes(searchLower) ||
        course.name.toLowerCase().includes(searchLower) ||
        (course.description && course.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredCourses(filtered);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('schedule.')) {
      const scheduleField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [scheduleField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingCourse) {
        await courseAPI.update(editingCourse._id, formData);
        setSuccess('Course updated successfully!');
      } else {
        await courseAPI.create(formData);
        setSuccess('Course created successfully!');
      }
      
      fetchCourses();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Save course error:', err);
      setError(err.message || 'Failed to save course. Please try again.');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      description: course.description || '',
      credits: course.credits.toString(),
      semester: course.semester.toString(),
      department_id: course.department_id?._id || '',
      instructor_id: course.instructor_id?._id || '',
      is_virtual: course.is_virtual,
      schedule: course.schedule || { days: [], time: '', room: '' }
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await courseAPI.delete(courseId);
      setSuccess('Course deleted successfully!');
      fetchCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete course error:', err);
      setError(err.message || 'Failed to delete course. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      credits: '3',
      semester: '1',
      department_id: '',
      instructor_id: '',
      is_virtual: false,
      schedule: {
        days: [],
        time: '',
        room: ''
      }
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BookOpen className="h-8 w-8 text-primary-600 mr-3" />
                Manage Courses
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage all courses in the system
                {!loading && <span className="ml-2 font-semibold text-primary-600">({courses.length} total courses)</span>}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center space-x-2"
            >
              {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              <span>{showForm ? 'Cancel' : 'Add New Course'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        {!showForm && !loading && courses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filter Courses</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by code or name..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({...filters, semester: e.target.value})}
                  className="input-field"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({...filters, department: e.target.value})}
                  className="input-field"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-semibold text-primary-600">{filteredCourses.length}</span> of <span className="font-semibold">{courses.length}</span> courses
            </div>
          </div>
        )}

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

        {/* Course Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., CS101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Introduction to Programming"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    rows="3"
                    placeholder="Course description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Credits *
                  </label>
                  <select
                    name="credits"
                    required
                    value={formData.credits}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5, 6].map(credit => (
                      <option key={credit} value={credit}>{credit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Semester *
                  </label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instructor
                  </label>
                  <select
                    name="instructor_id"
                    value={formData.instructor_id}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select instructor</option>
                    {facultyList.map(faculty => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} ({faculty.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_virtual"
                      checked={formData.is_virtual}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Virtual Class</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Schedule Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {days.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          formData.schedule.days.includes(day)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="text"
                    name="schedule.time"
                    value={formData.schedule.time}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., 9:00 AM - 10:30 AM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room/Location
                  </label>
                  <input
                    type="text"
                    name="schedule.room"
                    value={formData.schedule.room}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Room 101 or Virtual Lab"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingCourse ? 'Update Course' : 'Create Course'}</span>
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

        {/* Courses List */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {filters.search || filters.semester || filters.department ? 'Filtered Courses' : 'All Courses'}
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No courses yet. Create your first course!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
                >
                  Add New Course
                </button>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses match your filters. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCourses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">{course.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                          {course.credit_hours && (
                            <div className="text-xs text-gray-500">{course.credit_hours}</div>
                          )}
                          {course.prerequisites && course.prerequisites.length > 0 && (
                            <div className="text-xs text-primary-600 mt-1">
                              PreReq: {course.prerequisites.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {course.department_id?.code || course.department_id?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {course.credits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-semibold">
                            Sem {course.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {course.instructor_id?.name || <span className="text-gray-400">Not assigned</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            course.is_virtual 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {course.is_virtual ? 'Virtual' : 'Physical'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(course)}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                            title="Edit course"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete course"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCourses;

