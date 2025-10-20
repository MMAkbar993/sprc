// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// Student API
export const studentAPI = {
  getDashboard: async () => {
    return apiRequest('/students/dashboard');
  },

  getCourses: async (semester) => {
    const params = semester ? `?semester=${semester}` : '';
    return apiRequest(`/students/courses${params}`);
  },

  getCourseDetails: async (courseId) => {
    return apiRequest(`/students/courses/${courseId}`);
  },

  getGrades: async (semester) => {
    const params = semester ? `?semester=${semester}` : '';
    return apiRequest(`/students/grades${params}`);
  },

  submitAssignment: async (assignmentId, submissionData) => {
    return apiRequest(`/students/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },
};

// Course API
export const courseAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/courses${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (courseId) => {
    return apiRequest(`/courses/${courseId}`);
  },

  create: async (courseData) => {
    return apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  update: async (courseId, courseData) => {
    return apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  delete: async (courseId) => {
    return apiRequest(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  },

  getStudents: async (courseId) => {
    return apiRequest(`/courses/${courseId}/students`);
  },
};

// Admin API
export const adminAPI = {
  getDashboard: async () => {
    return apiRequest('/admin/dashboard');
  },

  getStudents: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/admin/students${queryString ? `?${queryString}` : ''}`);
  },

  getFaculty: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    return apiRequest(`/admin/faculty${queryString ? `?${queryString}` : ''}`);
  },

  getAnnouncements: async () => {
    return apiRequest('/admin/announcements');
  },

  createAnnouncement: async (announcementData) => {
    return apiRequest('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  },

  updateAnnouncement: async (announcementId, announcementData) => {
    return apiRequest(`/admin/announcements/${announcementId}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
  },

  deleteAnnouncement: async (announcementId) => {
    return apiRequest(`/admin/announcements/${announcementId}`, {
      method: 'DELETE',
    });
  },

  deleteStudent: async (studentId) => {
    return apiRequest(`/admin/students/${studentId}`, {
      method: 'DELETE',
    });
  },

  deleteFaculty: async (facultyId) => {
    return apiRequest(`/admin/faculty/${facultyId}`, {
      method: 'DELETE',
    });
  },
};

// Classroom API
export const classroomAPI = {
  getClassroom: async (courseId) => {
    return apiRequest(`/classroom/${courseId}`);
  },

  createSession: async (courseId, sessionData) => {
    return apiRequest(`/classroom/${courseId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  getSession: async (sessionId) => {
    return apiRequest(`/classroom/sessions/${sessionId}`);
  },

  updateSession: async (sessionId, sessionData) => {
    return apiRequest(`/classroom/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  },

  deleteSession: async (sessionId) => {
    return apiRequest(`/classroom/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },
};

// Grades API
export const gradesAPI = {
  getAssignmentGrades: async (assignmentId) => {
    return apiRequest(`/grades/assignments/${assignmentId}`);
  },

  createGrade: async (gradeData) => {
    return apiRequest('/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  },

  updateGrade: async (gradeId, gradeData) => {
    return apiRequest(`/grades/${gradeId}`, {
      method: 'PUT',
      body: JSON.stringify(gradeData),
    });
  },

  getCourseGrades: async (courseId) => {
    return apiRequest(`/grades/courses/${courseId}`);
  },
};

// Announcements API (public - for all users)
export const announcementsAPI = {
  getAll: async (limit) => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest(`/announcements${params}`);
  },

  getById: async (announcementId) => {
    return apiRequest(`/announcements/${announcementId}`);
  },
};

export default {
  authAPI,
  studentAPI,
  courseAPI,
  adminAPI,
  classroomAPI,
  gradesAPI,
  announcementsAPI,
};
