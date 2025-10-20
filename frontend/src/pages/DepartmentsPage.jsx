import React, { useState, useEffect } from 'react';
import { Code, Database, Laptop, Network, Smartphone, Globe, Users, GraduationCap, BookOpen, Loader, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI, courseAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DepartmentsPage = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [departmentStats, setDepartmentStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  const staticDepartments = [
    {
      id: 'urdu',
      name: 'BS Urdu',
      icon: <Code className="h-12 w-12" />,
      description: 'Comprehensive program in Urdu language, literature, and linguistics fostering appreciation of rich cultural heritage.',
      courses: ['Urdu Literature', 'Classical Poetry', 'Modern Fiction', 'Linguistics', 'Literary Criticism'],
      duration: '4 Years',
      color: 'from-primary-500 to-primary-600'
    },
    {
      id: 'it',
      name: 'BS Information Technology',
      icon: <Laptop className="h-12 w-12" />,
      description: 'Focus on practical applications of computing technology, empowering students to get the right career break in IT field.',
      courses: ['Web Development', 'Database Management', 'Network Administration', 'Cybersecurity', 'Project Management'],
      duration: '4 Years',
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      id: 'english',
      name: 'BS English',
      icon: <Globe className="h-12 w-12" />,
      description: 'Comprehensive English language and literature program developing communication and analytical skills.',
      courses: ['English Literature', 'Linguistics', 'Creative Writing', 'Literary Criticism', 'Communication Skills'],
      duration: '4 Years',
      color: 'from-accent-500 to-accent-600'
    },
    {
      id: 'botany',
      name: 'BS Botany',
      icon: <Network className="h-12 w-12" />,
      description: 'Study of plant life, ecology, and botanical sciences preparing students for careers in environmental and life sciences.',
      courses: ['Plant Anatomy', 'Plant Physiology', 'Ecology', 'Plant Taxonomy', 'Environmental Science'],
      duration: '4 Years',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'zoology',
      name: 'BS Zoology',
      icon: <Database className="h-12 w-12" />,
      description: 'Comprehensive study of animal life, behavior, and biological sciences for aspiring biologists and researchers.',
      courses: ['Animal Anatomy', 'Animal Physiology', 'Genetics', 'Evolution', 'Wildlife Biology'],
      duration: '4 Years',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'bba',
      name: 'BBA (Business Administration)',
      icon: <Smartphone className="h-12 w-12" />,
      description: 'Business administration and management program providing essential skills for successful careers in business sector.',
      courses: ['Business Management', 'Marketing', 'Finance', 'Human Resource Management', 'Entrepreneurship'],
      duration: '4 Years',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'bed',
      name: 'B.Ed (1.5 years program)',
      icon: <Code className="h-12 w-12" />,
      description: 'Education program for aspiring teachers focusing on pedagogical skills and teaching methodologies.',
      courses: ['Educational Psychology', 'Teaching Methods', 'Curriculum Development', 'Assessment & Evaluation', 'Classroom Management'],
      duration: '1.5 Years',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      
      // Fetch students and faculty if user is admin
      if (user?.role === 'admin') {
        const [studentsRes, facultyRes, coursesRes] = await Promise.all([
          adminAPI.getStudents().catch(() => ({ data: { students: [] } })),
          adminAPI.getFaculty().catch(() => ({ data: { faculty: [] } })),
          courseAPI.getAll().catch(() => ({ data: { courses: [] } }))
        ]);

        const students = studentsRes.data?.students || [];
        const faculty = facultyRes.data?.faculty || [];
        const courses = coursesRes.data?.courses || [];

        // Calculate stats per department
        const stats = {};
        staticDepartments.forEach(dept => {
          stats[dept.name] = {
            students: students.filter(s => s.department === dept.name).length,
            faculty: faculty.filter(f => f.department === dept.name).length,
            courses: courses.filter(c => c.department_id?.name === dept.name || c.department === dept.name).length
          };
        });

        setDepartmentStats(stats);
      }
      
      setDepartments(staticDepartments);
    } catch (error) {
      console.error('Error fetching department data:', error);
      setDepartments(staticDepartments);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Code className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our <span className="text-accent-400">Departments</span></h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Explore our comprehensive range of technology programs designed to prepare students 
              for successful careers in the digital age.
            </p>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300 border border-gray-100 hover:border-primary-200">
                {/* Header */}
                <div className={`bg-gradient-to-r ${dept.color} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative flex items-center space-x-4">
                    <div className="text-white">
                      {dept.icon}
                    </div>
                    <h2 className="text-xl font-bold">{dept.name}</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">{dept.description}</p>

                  {/* Stats */}
                  {user?.role === 'admin' && departmentStats[dept.name] ? (
                    <div className="mb-6 grid grid-cols-3 gap-2">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-xl font-bold text-blue-600">{departmentStats[dept.name].students}</div>
                        <div className="text-xs text-gray-600">Students</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-xl font-bold text-purple-600">{departmentStats[dept.name].faculty}</div>
                        <div className="text-xs text-gray-600">Faculty</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <BookOpen className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <div className="text-xl font-bold text-green-600">{departmentStats[dept.name].courses}</div>
                        <div className="text-xs text-gray-600">Courses</div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600">{dept.duration}</div>
                        <div className="text-sm text-gray-500">Program Duration</div>
                      </div>
                    </div>
                  )}

                  {/* Key Courses */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Courses</h3>
                    <div className="space-y-2">
                      {dept.courses.slice(0, 3).map((course, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-white px-3 py-2 rounded-lg border border-gray-100">
                          {course}
                        </div>
                      ))}
                      {dept.courses.length > 3 && (
                        <div className="text-sm text-primary-600 font-medium">
                          +{dept.courses.length - 3} more courses
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {user?.role === 'admin' ? (
                      <>
                        <Link
                          to={`/admin/students?department=${encodeURIComponent(dept.name)}`}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
                        >
                          <Users className="h-4 w-4" />
                          <span>View Students</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                          to={`/admin/faculty?department=${encodeURIComponent(dept.name)}`}
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
                        >
                          <GraduationCap className="h-4 w-4" />
                          <span>View Faculty</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </>
                    ) : (
                      <button className="w-full bg-gradient-to-r from-gray-100 to-gray-50 hover:from-primary-50 hover:to-primary-100 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-gray-200 hover:border-primary-200">
                        Learn More
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our <span className="text-primary-600">Departments</span>?
            </h2>
            <p className="text-xl text-gray-600">
              Our programs are designed with industry needs and student success in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 hover:shadow-soft transition-all duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Industry-Relevant Curriculum</h3>
              <p className="text-gray-600 leading-relaxed">
                Our curriculum is regularly updated to reflect current industry trends and requirements, 
                ensuring graduates are job-ready.
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 hover:shadow-soft transition-all duration-300">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Laptop className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Hands-on Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Emphasis on practical projects, internships, and real-world applications to build 
                strong technical and problem-solving skills.
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 hover:shadow-soft transition-all duration-300">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Network className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Industry Connections</h3>
              <p className="text-gray-600 leading-relaxed">
                Strong partnerships with technology companies provide internship opportunities 
                and direct pathways to employment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your <span className="text-accent-400">Journey</span>?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Choose from our diverse range of technology programs and begin building your future today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/admissions" 
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-soft hover:shadow-medium"
            >
              Apply Now
            </a>
            <a 
              href="/contact" 
              className="border-2 border-white/80 text-white hover:bg-white hover:text-secondary-600 px-8 py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm"
            >
              Schedule Visit
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DepartmentsPage;

