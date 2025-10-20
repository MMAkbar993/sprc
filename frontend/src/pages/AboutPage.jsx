import React from 'react';
import { BookOpen, Users, Award, Target, Eye, Heart } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Academic Excellence",
      description: "Committed to providing the highest quality education in Information Technology and Computer Science."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Focus",
      description: "Building a strong community of learners, educators, and industry professionals."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Innovation",
      description: "Embracing cutting-edge technology and innovative teaching methodologies."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Career Readiness",
      description: "Preparing students for successful careers in the technology industry."
    }
  ];

  const milestones = [
    { year: "2015", event: "College Established", description: "SPRC was founded with a vision to provide quality IT education" },
    { year: "2018", event: "University Affiliation", description: "Affiliated with Ghazi University, DG Khan" },
    { year: "2020", event: "Digital Transformation", description: "Launched comprehensive online learning platform" },
    { year: "2023", event: "Industry Partnerships", description: "Established partnerships with leading tech companies" },
    { year: "2025", event: "Modern Campus", description: "Inaugurated state-of-the-art facilities and virtual classrooms" }
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About <span className="text-accent-400">SPRC</span></h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Southern Punjab Redeemer College is dedicated to shaping the future of technology 
              education through innovative teaching methods and comprehensive academic programs.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To provide world-class education in Information Technology and Computer Science, 
                fostering innovation, critical thinking, and practical skills that prepare students 
                for successful careers in the rapidly evolving technology landscape.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="h-8 w-8 text-secondary-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To be the leading institution for technology education in Southern Punjab, 
                recognized for academic excellence, innovative research, and producing graduates 
                who contribute significantly to the global technology ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our <span className="text-primary-600">Values</span></h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do at SPRC
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 text-center border border-gray-100 hover:border-primary-200"
              >
                <div className="text-primary-600 mb-6 flex justify-center">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our <span className="text-secondary-600">Journey</span></h2>
            <p className="text-xl text-gray-600">
              A decade of growth, innovation, and academic excellence
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-secondary-200"></div>
            
            {/* Timeline Items */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-start">
                  {/* Timeline Dot */}
                  <div className="absolute left-6 w-4 h-4 bg-secondary-600 rounded-full border-4 border-white shadow-soft"></div>
                  
                  {/* Content */}
                  <div className="ml-20">
                    <div className="bg-gradient-to-r from-secondary-50 to-white rounded-2xl p-6 border border-secondary-100 shadow-soft">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl font-bold text-secondary-600 mr-4">
                          {milestone.year}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {milestone.event}
                        </h3>
                      </div>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Leadership <span className="text-accent-600">Team</span></h2>
            <p className="text-xl text-gray-600">
              Experienced educators and administrators dedicated to student success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-soft p-6 text-center border border-gray-100 hover:shadow-medium transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-white text-2xl font-bold">DR</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Muhammad Ashfaq Bokhari</h3>
              <p className="text-primary-600 font-medium mb-3">CHAIRMAN BOARD OF GOVERNER'S</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ph.D. in Computer Science with 20+ years of academic and industry experience
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6 text-center border border-gray-100 hover:shadow-medium transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-white text-2xl font-bold">PK</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Khawaja Thair Abbas</h3>
              <p className="text-secondary-600 font-medium mb-3">CHIEF EXECUTIVE'S</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                M.S. in Software Engineering, leading curriculum development and industry partnerships
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6 text-center border border-gray-100 hover:shadow-medium transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                <span className="text-white text-2xl font-bold">AF</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Shahjahan Laghari</h3>
              <p className="text-accent-600 font-medium mb-3">PRINCIPAL</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                M.S. in Computer Science, specializing in educational technology and student development
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our <span className="text-accent-400">Community</span></h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Be part of SPRC's mission to create the next generation of technology leaders
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/admissions" 
              className="bg-white text-secondary-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-soft hover:shadow-medium"
            >
              Apply for Admission
            </a>
            <a 
              href="/contact" 
              className="border-2 border-white/80 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-secondary-600 transition-all duration-200 backdrop-blur-sm"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

