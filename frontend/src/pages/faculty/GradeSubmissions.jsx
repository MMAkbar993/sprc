import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Clock,
  Award,
  User,
  Calendar,
  Download,
  ExternalLink,
  AlertCircle,
  Save
} from 'lucide-react';

const GradeSubmissions = () => {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignment');
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({
    marks_obtained: '',
    feedback: ''
  });
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/assignments/${assignmentId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.data.submissions);
        if (data.data.submissions.length > 0) {
          // Get assignment details from first submission
          const firstSubmission = data.data.submissions[0];
          setAssignment(firstSubmission.assignment_id);
        }
      } else {
        setError(data.message || 'Failed to load submissions');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    setGrading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/assignments/${gradingSubmission._id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gradeData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Submission graded successfully!');
        setGradingSubmission(null);
        setGradeData({ marks_obtained: '', feedback: '' });
        fetchSubmissions();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to grade submission');
      }
    } catch (err) {
      console.error('Error grading submission:', err);
      setError('Network error. Please try again.');
    } finally {
      setGrading(false);
    }
  };

  const openGradeModal = (submission) => {
    setGradingSubmission(submission);
    if (submission.grade) {
      setGradeData({
        marks_obtained: submission.grade.marks_obtained.toString(),
        feedback: submission.grade.feedback || ''
      });
    } else {
      setGradeData({ marks_obtained: '', feedback: '' });
    }
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

  const getStatusBadge = (submission) => {
    if (submission.status === 'graded') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
          <CheckCircle className="h-4 w-4" />
          <span>Graded</span>
        </span>
      );
    }
    if (submission.is_late) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
          <Clock className="h-4 w-4" />
          <span>Late</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-300">
        <Clock className="h-4 w-4" />
        <span>Pending</span>
      </span>
    );
  };

  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const pendingCount = submissions.filter(s => s.status !== 'graded').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 text-primary-600 mr-3" />
            Grade Submissions
          </h1>
          {assignment && (
            <div className="mt-4 bg-white rounded-xl shadow-soft p-4 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">{assignment.title}</h2>
              <p className="text-gray-600 mt-1">
                Total Marks: {assignment.total_marks} | Due: {formatDate(assignment.due_date)}
              </p>
            </div>
          )}
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
          <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900">{submissions.length}</p>
              </div>
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-green-50 rounded-xl shadow-soft p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Graded</p>
                <p className="text-3xl font-bold text-green-900">{gradedCount}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl shadow-soft p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Pending</p>
                <p className="text-3xl font-bold text-blue-900">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="bg-white rounded-2xl shadow-card p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.student_id.user_id.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {submission.student_id.student_id}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(submission)}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {formatDate(submission.submitted_at)}</span>
                  </div>

                  {submission.submission_text && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Written Response:</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{submission.submission_text}</p>
                    </div>
                  )}

                  {submission.submission_link && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-primary-600" />
                      <a
                        href={submission.submission_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline text-sm"
                      >
                        {submission.submission_link}
                      </a>
                    </div>
                  )}

                  {submission.submission_file && (
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        File: {submission.submission_file.originalname}
                      </span>
                    </div>
                  )}
                </div>

                {/* Grade Display */}
                {submission.grade && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-green-900 mb-2">Grade:</p>
                    <p className="text-3xl font-bold text-green-900 mb-2">
                      {submission.grade.marks_obtained} / {assignment.total_marks}
                    </p>
                    {submission.grade.feedback && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="text-sm font-semibold text-green-900 mb-1">Feedback:</p>
                        <p className="text-sm text-green-800">{submission.grade.feedback}</p>
                      </div>
                    )}
                    <p className="text-xs text-green-700 mt-2">
                      Graded on: {formatDate(submission.grade.graded_at)}
                    </p>
                  </div>
                )}

                {/* Grade Button */}
                <button
                  onClick={() => openGradeModal(submission)}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Award className="h-5 w-5" />
                  <span>{submission.grade ? 'Update Grade' : 'Grade Submission'}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Grading Modal */}
        {gradingSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Grade Submission</h2>
                <p className="text-gray-600 mt-1">
                  {gradingSubmission.student_id.user_id.name} - {gradingSubmission.student_id.student_id}
                </p>
              </div>

              <form onSubmit={handleGradeSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marks Obtained (out of {assignment?.total_marks}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={assignment?.total_marks}
                    value={gradeData.marks_obtained}
                    onChange={(e) => setGradeData({ ...gradeData, marks_obtained: e.target.value })}
                    className="input-field"
                    placeholder={`0 - ${assignment?.total_marks}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                    className="input-field"
                    rows="6"
                    placeholder="Provide feedback to the student..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={grading}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {grading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>Save Grade</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
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

export default GradeSubmissions;

