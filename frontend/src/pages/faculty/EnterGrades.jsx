import React, { useState, useEffect } from 'react';
import {
  Award,
  Save,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Loader
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courseAPI, gradesAPI } from '../../services/api';

const EnterGrades = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [semester, setSemester] = useState('');
  const [examType, setExamType] = useState('final');
  const [totalMarks, setTotalMarks] = useState('100');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      const allCourses = response.data?.courses || [];
      
      // Filter courses assigned to this faculty
      const myCourses = user?.role === 'faculty' && user?._id
        ? allCourses.filter(course => 
            course.instructor_id?._id === user._id || 
            course.instructor_id === user._id
          )
        : allCourses;
      
      setCourses(myCourses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Get enrolled students through enrollment API
      const response = await fetch(`http://localhost:5000/api/attendance/course/${selectedCourse}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Initialize students with empty marks
        const studentsWithMarks = data.data.students.map(student => ({
          ...student,
          marks_obtained: '',
          remarks: ''
        }));
        setStudents(studentsWithMarks);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, marks) => {
    setStudents(prev =>
      prev.map(student =>
        student._id === studentId ? { ...student, marks_obtained: marks } : student
      )
    );
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents(prev =>
      prev.map(student =>
        student._id === studentId ? { ...student, remarks } : student
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !semester || !totalMarks) {
      setError('Please select course, semester, and enter total marks');
      return;
    }

    const studentsWithMarks = students.filter(s => s.marks_obtained !== '');
    
    if (studentsWithMarks.length === 0) {
      setError('Please enter marks for at least one student');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      let successCount = 0;
      let errorCount = 0;

      for (const student of studentsWithMarks) {
        try {
          const response = await fetch('http://localhost:5000/api/grades', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              student_id: student._id,
              course_id: selectedCourse,
              semester,
              exam_type: examType,
              marks_obtained: parseFloat(student.marks_obtained),
              total_marks: parseFloat(totalMarks),
              remarks: student.remarks
            })
          });

          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        setSuccess(`Grades entered successfully for ${successCount} students!`);
        // Reset marks
        setStudents(prev => prev.map(s => ({ ...s, marks_obtained: '', remarks: '' })));
        setTimeout(() => setSuccess(''), 3000);
      }
      
      if (errorCount > 0) {
        setError(`Failed to enter grades for ${errorCount} students`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getCourseInfo = () => {
    const course = courses.find(c => c._id === selectedCourse);
    return course;
  };

  const studentsWithMarks = students.filter(s => s.marks_obtained !== '');
  const courseInfo = getCourseInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Award className="h-8 w-8 text-primary-600 mr-3" />
            Enter Final Grades
          </h1>
          <p className="text-gray-600 mt-2">Enter final grades and calculate student CGPA</p>
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

        {/* Configuration */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Course *
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a course</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Semester *
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="input-field"
                placeholder="e.g., Spring 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exam Type *
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="input-field"
              >
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Marks *
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="input-field"
                min="1"
                placeholder="100"
              />
            </div>
          </div>

          {courseInfo && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Course Credits:</span> {courseInfo.credits} | 
                <span className="font-semibold"> Semester:</span> {courseInfo.semester}
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        {students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-soft p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl shadow-soft p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Grades Entered</p>
                  <p className="text-2xl font-bold text-blue-900">{studentsWithMarks.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl shadow-soft p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{students.length - studentsWithMarks.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        )}

        {/* Students List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading students...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Enter Student Grades</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marks Obtained
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Predicted Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => {
                      const percentage = student.marks_obtained && totalMarks 
                        ? ((parseFloat(student.marks_obtained) / parseFloat(totalMarks)) * 100).toFixed(1)
                        : '-';
                      
                      let letterGrade = '-';
                      if (percentage !== '-') {
                        const pct = parseFloat(percentage);
                        if (pct >= 90) letterGrade = 'A+';
                        else if (pct >= 85) letterGrade = 'A';
                        else if (pct >= 80) letterGrade = 'A-';
                        else if (pct >= 75) letterGrade = 'B+';
                        else if (pct >= 70) letterGrade = 'B';
                        else if (pct >= 65) letterGrade = 'B-';
                        else if (pct >= 60) letterGrade = 'C+';
                        else if (pct >= 55) letterGrade = 'C';
                        else if (pct >= 50) letterGrade = 'C-';
                        else if (pct >= 45) letterGrade = 'D';
                        else letterGrade = 'F';
                      }

                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.student_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              max={totalMarks}
                              step="0.01"
                              value={student.marks_obtained}
                              onChange={(e) => handleMarksChange(student._id, e.target.value)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="0"
                            />
                            <span className="ml-2 text-sm text-gray-600">/ {totalMarks}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {percentage !== '-' ? `${percentage}%` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {letterGrade !== '-' && (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                ['A+', 'A', 'A-'].includes(letterGrade) ? 'bg-green-100 text-green-800' :
                                ['B+', 'B', 'B-'].includes(letterGrade) ? 'bg-blue-100 text-blue-800' :
                                ['C+', 'C', 'C-'].includes(letterGrade) ? 'bg-yellow-100 text-yellow-800' :
                                letterGrade === 'D' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {letterGrade}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={student.remarks}
                              onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Optional remarks"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={saving || studentsWithMarks.length === 0}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving Grades...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Grades ({studentsWithMarks.length} students)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : selectedCourse && !loading ? (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students enrolled in this course</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-12 border border-gray-100 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select a course to view students and enter grades</p>
          </div>
        )}

        {/* Grade Scale Reference */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Grading Scale Reference</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="font-bold text-green-700 mb-1">A+ / A</div>
              <div className="text-gray-600">90-100%</div>
              <div className="text-sm text-gray-500">4.0 GPA</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="font-bold text-blue-700 mb-1">B+/B/B-</div>
              <div className="text-gray-600">65-79%</div>
              <div className="text-sm text-gray-500">2.7-3.3</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="font-bold text-yellow-700 mb-1">C+/C/C-</div>
              <div className="text-gray-600">50-64%</div>
              <div className="text-sm text-gray-500">1.7-2.3</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="font-bold text-orange-700 mb-1">D</div>
              <div className="text-gray-600">45-49%</div>
              <div className="text-sm text-gray-500">1.0 GPA</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="font-bold text-red-700 mb-1">F</div>
              <div className="text-gray-600">&lt;45%</div>
              <div className="text-sm text-gray-500">0.0 GPA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterGrades;

