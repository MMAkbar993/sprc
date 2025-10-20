import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  CheckCircle, 
  DollarSign, 
  Clock,
  Users,
  Award,
  Download
} from 'lucide-react';

const AdmissionsPage = () => {
  const [selectedProgram, setSelectedProgram] = useState('bs-it');

  const programs = [
    {
      id: 'bs-it',
      name: 'BS Information Technology',
      duration: '4 Years',
      credits: '132 Credit Hours',
      fee: '150,000 PKR/Semester',
      eligibility: 'FSc Pre-Engineering/ICS or Equivalent',
      description: 'Comprehensive program focusing on practical IT skills, web development, database management, and system administration.'
    },
    {
      id: 'bs-cs',
      name: 'BS Computer Science',
      duration: '4 Years',
      credits: '132 Credit Hours',
      fee: '150,000 PKR/Semester',
      eligibility: 'FSc Pre-Engineering/ICS or Equivalent',
      description: 'Rigorous program covering algorithms, programming, software engineering, and theoretical computer science foundations.'
    },
    {
      id: 'bs-se',
      name: 'BS Software Engineering',
      duration: '4 Years',
      credits: '132 Credit Hours',
      fee: '160,000 PKR/Semester',
      eligibility: 'FSc Pre-Engineering/ICS or Equivalent',
      description: 'Specialized program in software development lifecycle, project management, and large-scale system design.'
    }
  ];

  const admissionProcess = [
    {
      step: 1,
      title: 'Online Application',
      description: 'Complete the online application form with personal and academic details',
      icon: <FileText className="h-6 w-6" />
    },
    {
      step: 2,
      title: 'Document Submission',
      description: 'Submit required documents including transcripts, certificates, and photographs',
      icon: <Upload className="h-6 w-6" />
    },
    {
      step: 3,
      title: 'Entrance Test',
      description: 'Appear for the university entrance test (if required by the program)',
      icon: <BookOpen className="h-6 w-6" />
    },
    {
      step: 4,
      title: 'Merit List',
      description: 'Check merit list publication and admission confirmation',
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      step: 5,
      title: 'Fee Payment',
      description: 'Pay admission fee and complete enrollment process',
      icon: <DollarSign className="h-6 w-6" />
    }
  ];

  const importantDates = [
    { event: 'Application Start Date', date: 'March 1, 2025', status: 'upcoming' },
    { event: 'Application Deadline', date: 'June 30, 2025', status: 'upcoming' },
    { event: 'Entrance Test', date: 'July 15, 2025', status: 'upcoming' },
    { event: 'Merit List Publication', date: 'July 30, 2025', status: 'upcoming' },
    { event: 'Classes Begin', date: 'September 1, 2025', status: 'upcoming' }
  ];

  const requiredDocuments = [
    'FSc/A-Level Certificate & Detailed Marks Certificate',
    'Matriculation/O-Level Certificate & Detailed Marks Certificate',
    'CNIC Copy (Student & Father/Guardian)',
    'Recent Passport Size Photographs',
    'Domicile Certificate',
    'Character Certificate from Last Institution',
    'Medical Fitness Certificate',
    'Hafiz-e-Quran Certificate (if applicable)'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Admissions <span className="text-accent-400">2025</span></h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
              Join SPRC and embark on a journey of academic excellence and professional growth 
              in the field of Information Technology and Computer Science.
            </p>
            <button className="bg-white text-secondary-600 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-soft hover:shadow-medium">
              Apply Now
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100">
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Students Enrolled</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-accent-50 to-white rounded-2xl border border-accent-100">
              <div className="text-3xl font-bold text-accent-600 mb-2">95%</div>
              <div className="text-gray-600">Placement Rate</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-secondary-50 to-white rounded-2xl border border-secondary-100">
              <div className="text-3xl font-bold text-secondary-600 mb-2">25+</div>
              <div className="text-gray-600">Faculty Members</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">10+</div>
              <div className="text-gray-600">Years of Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Available <span className="text-primary-600">Programs</span>
            </h2>
            <p className="text-xl text-gray-600">
              Choose from our comprehensive range of undergraduate programs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div 
                key={program.id}
                className={`bg-white rounded-2xl shadow-soft p-6 cursor-pointer transition-all duration-300 border ${
                  selectedProgram === program.id 
                    ? 'ring-2 ring-primary-500 shadow-medium border-primary-200' 
                    : 'border-gray-100 hover:shadow-medium hover:border-primary-200'
                }`}
                onClick={() => setSelectedProgram(program.id)}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{program.name}</h3>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{program.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{program.credits}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{program.fee}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{program.eligibility}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Admission <span className="text-secondary-600">Process</span>
            </h2>
            <p className="text-xl text-gray-600">
              Follow these simple steps to secure your admission
            </p>
          </div>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-12 left-12 right-12 h-0.5 bg-secondary-200 hidden md:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {admissionProcess.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-soft">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Important Dates */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Important <span className="text-primary-600">Dates</span></h2>
              <div className="space-y-4">
                {importantDates.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-soft flex items-center justify-between border border-gray-100 hover:shadow-medium transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary-600" />
                      </div>
                      <span className="font-medium text-gray-900">{item.event}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{item.date}</div>
                      <div className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">Upcoming</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Required <span className="text-secondary-600">Documents</span></h2>
              <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
                <div className="space-y-3">
                  {requiredDocuments.map((doc, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-accent-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{doc}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-soft">
                    <Download className="h-4 w-4" />
                    <span>Download Document Checklist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Admissions */}
      <section className="py-16 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Help with <span className="text-accent-400">Admissions</span>?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Our admissions team is here to guide you through the entire process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+92-xxx-xxxxxxx" 
              className="bg-white text-secondary-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-soft"
            >
              Call Admissions Office
            </a>
            <a 
              href="/contact" 
              className="border-2 border-white/80 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-secondary-600 transition-all duration-200 backdrop-blur-sm"
            >
              Schedule a Visit
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// Upload icon component (since it's not in lucide-react by default)
const Upload = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export default AdmissionsPage;

