import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  Filter,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Loader,
  Mail,
  Phone,
  Award
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const ManageFaculty = () => {
  const [searchParams] = useSearchParams();
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    // Get department from URL parameter
    const deptParam = searchParams.get('department');
    if (deptParam) {
      setSelectedDepartment(deptParam);
    }
    fetchFaculty();
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedDepartment, faculty]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFaculty();
      const facultyData = response.data?.faculty || [];
      setFaculty(facultyData);
      setFilteredFaculty(facultyData);
      setError('');
    } catch (err) {
      console.error('Error fetching faculty:', err);
      setError('Failed to load faculty. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...faculty];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(searchLower) ||
        member.employee_id?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.designation?.toLowerCase().includes(searchLower)
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }

    setFilteredFaculty(filtered);
  };

  const handleDelete = async (facultyId) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      await adminAPI.deleteFaculty(facultyId);
      setSuccess('Faculty member deleted successfully!');
      fetchFaculty();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting faculty:', err);
      setError(err.message || 'Failed to delete faculty member.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <GraduationCap className="h-8 w-8 text-primary-600 mr-3" />
                Manage Faculty
              </h1>
              <p className="text-gray-600 mt-2">
                View and manage all faculty members in the system
                {!loading && <span className="ml-2 font-semibold text-primary-600">({faculty.length} total faculty)</span>}
              </p>
            </div>
            <Link
              to="/register/faculty"
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center space-x-2"
            >
              <UserPlus className="h-5 w-5" />
              <span>Add Faculty</span>
            </Link>
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

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Faculty</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, email, or designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Departments</option>
                <option value="BS Urdu">BS Urdu</option>
                <option value="BS Information Technology">BS Information Technology</option>
                <option value="BS English">BS English</option>
                <option value="BS Botany">BS Botany</option>
                <option value="BS Zoology">BS Zoology</option>
                <option value="BBA (Business Administration)">BBA (Business Administration)</option>
                <option value="B.Ed (1.5 years program)">B.Ed (1.5 years program)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-primary-600">{filteredFaculty.length}</span> of <span className="font-semibold">{faculty.length}</span> faculty members
          </div>
        </div>

        {/* Faculty Table */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading faculty...</p>
              </div>
            ) : filteredFaculty.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No faculty members found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Faculty Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFaculty.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.name?.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm text-gray-900">{member.employee_id || member.employeeId}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.department || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                            {member.designation || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col space-y-1">
                            {member.phone && (
                              <div className="flex items-center text-xs text-gray-600">
                                <Phone className="h-3 w-3 mr-1" />
                                {member.phone}
                              </div>
                            )}
                            {member.qualification && (
                              <div className="flex items-center text-xs text-gray-600">
                                <Award className="h-3 w-3 mr-1" />
                                {member.qualification}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            title="View details"
                            className="text-primary-600 hover:text-primary-900 inline-block"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            title="Edit faculty"
                            className="text-secondary-600 hover:text-secondary-900 inline-block"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(member._id)}
                            title="Delete faculty"
                            className="text-red-600 hover:text-red-900 inline-block"
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

export default ManageFaculty;

