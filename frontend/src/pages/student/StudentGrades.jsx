import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Calendar, FileText, Download, AlertCircle, BookOpen } from 'lucide-react';

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrades();
    fetchSummary();
  }, [selectedSemester]);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const semesterParam = selectedSemester !== 'all' ? `?semester=${selectedSemester}` : '';
      const response = await fetch(`http://localhost:5000/api/grades/my-grades${semesterParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setGrades(data.data.grades);
      } else {
        setError(data.message || 'Failed to load grades');
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/grades/my-grades/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSummary(data.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const getGradeColor = (letter_grade) => {
    if (['A+', 'A', 'A-'].includes(letter_grade)) return 'text-green-600';
    if (['B+', 'B', 'B-'].includes(letter_grade)) return 'text-blue-600';
    if (['C+', 'C', 'C-'].includes(letter_grade)) return 'text-yellow-600';
    if (letter_grade === 'D') return 'text-orange-600';
    return 'text-red-600';
  };

  const getBgColor = (letter_grade) => {
    if (['A+', 'A', 'A-'].includes(letter_grade)) return 'bg-green-50 border-green-200';
    if (['B+', 'B', 'B-'].includes(letter_grade)) return 'bg-blue-50 border-blue-200';
    if (['C+', 'C', 'C-'].includes(letter_grade)) return 'bg-yellow-50 border-yellow-200';
    if (letter_grade === 'D') return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const semesters = summary?.semesterSummary?.map(s => s.semester) || [];
  const filteredGrades = selectedSemester === 'all'
    ? grades
    : grades.filter(g => g.semester === selectedSemester);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Award className="h-8 w-8 text-primary-600 mr-3" />
            My Grades
          </h1>
          <p className="text-gray-600 mt-2">Track your academic performance and CGPA</p>
            </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
              </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading grades...</p>
          </div>
        ) : (
          <>
            {/* CGPA Overview */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-card p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-primary-100">CGPA</p>
                    <TrendingUp className="h-6 w-6 text-primary-200" />
                  </div>
                  <p className="text-4xl font-bold">{summary.cgpa}</p>
                  <p className="text-primary-100 mt-2">Out of 4.0</p>
                </div>

                <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Total Credits</p>
                  <p className="text-3xl font-bold text-gray-900">{summary.totalCredits}</p>
                </div>

                <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Courses Completed</p>
                  <p className="text-3xl font-bold text-gray-900">{summary.totalCourses}</p>
        </div>

                <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Current Semester</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.semesterSummary?.[summary.semesterSummary.length - 1]?.semester || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Semester Filter */}
            {semesters.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedSemester('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSemester === 'all'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Semesters
                  </button>
            {semesters.map((semester) => (
              <button
                      key={semester}
                      onClick={() => setSelectedSemester(semester)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedSemester === semester
                          ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                      {semester}
              </button>
            ))}
          </div>
        </div>
            )}

            {/* Grades Table */}
            {filteredGrades.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No grades available yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Grade Details</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Semester
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Marks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            GPA
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Credits
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredGrades.map((grade) => (
                          <tr key={grade._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                                  <div className="text-sm font-medium text-gray-900">{grade.course_id.code}</div>
                                  <div className="text-sm text-gray-500">{grade.course_id.name}</div>
                                </div>
                  </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.semester}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {grade.marks_obtained}/{grade.total_marks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.percentage}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getBgColor(grade.letter_grade)} ${getGradeColor(grade.letter_grade)}`}>
                                {grade.letter_grade}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {grade.grade_point.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {grade.credits}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Semester Summary */}
            {summary?.semesterSummary && summary.semesterSummary.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Semester-wise Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {summary.semesterSummary.map((sem) => (
                    <div key={sem.semester} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                      <h3 className="font-semibold text-gray-900 mb-4">{sem.semester}</h3>
                  <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">SGPA</span>
                          <span className="font-bold text-primary-600 text-lg">{sem.sgpa}</span>
                          </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Credits</span>
                          <span className="font-semibold text-gray-900">{sem.totalCredits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Courses</span>
                          <span className="font-semibold text-gray-900">{sem.coursesCompleted}</span>
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
            )}

            {/* Grade Scale Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Grading Scale</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-700">A+ / A</div>
                  <div className="text-gray-600">90-100% | 4.0</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-700">B+/B/B-</div>
                  <div className="text-gray-600">65-79% | 2.7-3.3</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-700">C+/C/C-</div>
                  <div className="text-gray-600">50-64% | 1.7-2.3</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-700">D</div>
                  <div className="text-gray-600">45-49% | 1.0</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-red-700">F</div>
                  <div className="text-gray-600">&lt;45% | 0.0</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentGrades;
