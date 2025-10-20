import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  Link as LinkIcon,
  Download,
  Award
} from 'lucide-react';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    submission_text: '',
    submission_link: '',
    file: null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [filter]);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`http://localhost:5000/api/assignments/my-assignments${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAssignments(data.data.assignments);
      } else {
        setError(data.message || 'Failed to load assignments');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSubmissionData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (submissionData.submission_text) {
        formData.append('submission_text', submissionData.submission_text);
      }
      if (submissionData.submission_link) {
        formData.append('submission_link', submissionData.submission_link);
      }
      if (submissionData.file) {
        formData.append('file', submissionData.file);
      }

      const isUpdate = selectedAssignment.submission;
      const url = isUpdate
        ? `http://localhost:5000/api/assignments/${selectedAssignment._id}/update-submission`
        : `http://localhost:5000/api/assignments/${selectedAssignment._id}/submit`;
      
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(isUpdate ? 'Submission updated successfully!' : 'Assignment submitted successfully!');
        setShowSubmitModal(false);
        setSubmissionData({ submission_text: '', submission_link: '', file: null });
        fetchAssignments();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to submit assignment');
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    if (assignment.submission) {
      setSubmissionData({
        submission_text: assignment.submission.submission_text || '',
        submission_link: assignment.submission.submission_link || '',
        file: null
      });
    } else {
      setSubmissionData({ submission_text: '', submission_link: '', file: null });
    }
    setShowSubmitModal(true);
  };

  const getStatusBadge = (assignment) => {
    if (assignment.submission) {
      if (assignment.submission.status === 'graded') {
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
            <CheckCircle className="h-4 w-4" />
            <span>Graded</span>
          </span>
        );
      }
      if (assignment.submission.is_late) {
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
            <Clock className="h-4 w-4" />
            <span>Submitted Late</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-300">
          <CheckCircle className="h-4 w-4" />
          <span>Submitted</span>
        </span>
      );
    }
    if (assignment.isOverdue) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300">
          <XCircle className="h-4 w-4" />
          <span>Overdue</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-300">
        <Clock className="h-4 w-4" />
        <span>Pending</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = assignments.filter(a => !a.submission && !a.isOverdue).length;
  const submittedCount = assignments.filter(a => a.submission).length;
  const overdueCount = assignments.filter(a => !a.submission && a.isOverdue).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 text-primary-600 mr-3" />
            My Assignments
          </h1>
          <p className="text-gray-600 mt-2">View and submit your assignments</p>
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl shadow-soft p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl shadow-soft p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Submitted</p>
                <p className="text-3xl font-bold text-blue-900">{submittedCount}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-xl shadow-soft p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Overdue</p>
                <p className="text-3xl font-bold text-red-900">{overdueCount}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-soft p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-3">
            {['all', 'pending', 'submitted', 'overdue'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === filterOption
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Assignments List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No assignments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
                      {getStatusBadge(assignment)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {assignment.course_id.code} - {assignment.course_id.name}
                    </p>
                    {assignment.description && (
                      <p className="text-gray-700 mt-2">{assignment.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>Type: <span className="font-medium capitalize">{assignment.type}</span></span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>Total Marks: <span className="font-medium">{assignment.total_marks}</span></span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className={assignment.isOverdue && !assignment.submission ? 'text-red-600 font-medium' : ''}>
                      Due: {formatDate(assignment.due_date)}
                    </span>
                  </div>
                </div>

                {/* Submission Info */}
                {assignment.submission && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Your Submission:</p>
                    <p className="text-sm text-blue-800 mb-2">
                      Submitted: {formatDate(assignment.submission.submitted_at)}
                    </p>
                    {assignment.submission.grade && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Grade:</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {assignment.submission.grade.marks_obtained} / {assignment.total_marks}
                        </p>
                        {assignment.submission.grade.feedback && (
                          <p className="text-sm text-blue-800 mt-2">
                            <span className="font-medium">Feedback:</span> {assignment.submission.grade.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  {!assignment.submission && !assignment.isOverdue && (
                    <button
                      onClick={() => openSubmitModal(assignment)}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Submit Assignment</span>
                    </button>
                  )}
                  {assignment.submission && assignment.submission.status !== 'graded' && (
                    <button
                      onClick={() => openSubmitModal(assignment)}
                      className="flex-1 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-secondary-600 hover:to-secondary-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Update Submission</span>
                    </button>
                  )}
                  {assignment.isOverdue && !assignment.submission && (
                    <button
                      onClick={() => openSubmitModal(assignment)}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Submit Late</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedAssignment?.submission ? 'Update Submission' : 'Submit Assignment'}
                </h2>
                <p className="text-gray-600 mt-1">{selectedAssignment?.title}</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Written Response
                  </label>
                  <textarea
                    value={submissionData.submission_text}
                    onChange={(e) => setSubmissionData({ ...submissionData, submission_text: e.target.value })}
                    className="input-field"
                    rows="6"
                    placeholder="Enter your response here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Link/URL (Optional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={submissionData.submission_link}
                      onChange={(e) => setSubmissionData({ ...submissionData, submission_link: e.target.value })}
                      className="input-field pl-10"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="input-field"
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted: PDF, DOC, DOCX, TXT, ZIP, RAR, Images (Max 10MB)
                  </p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;

