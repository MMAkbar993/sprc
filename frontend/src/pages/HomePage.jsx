import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  Video,
  ArrowRight,
  Calendar,
  MapPin,
  GraduationCap
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Quality Education",
      description: "Highly innovative skill oriented university affiliated courses"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Qualified Faculty",
      description: "Highly qualified and motivated academic staff"
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Modern Facilities",
      description: "State of the art classrooms, computer labs, science labs, and library"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "University Affiliated",
      description: "Affiliated with Ghazi University, DG Khan"
    }
  ];

  const programs = [
    {
      title: "BS Urdu",
      description: "Comprehensive Urdu language and literature program"
    },
    {
      title: "BS Information Technology",
      description: "IT program empowering students for career in technology"
    },
    {
      title: "BS English",
      description: "English language and literature studies"
    },
    {
      title: "BS Botany",
      description: "Plant sciences and biological studies"
    },
    {
      title: "BS Zoology",
      description: "Animal sciences and biological research"
    },
    {
      title: "BBA",
      description: "Business administration and management program"
    },
    {
      title: "B.Ed (1.5 years)",
      description: "Education program for aspiring teachers"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm animate-bounce-slow">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
              Welcome to <span className="text-accent-300 hover:text-accent-200 transition-colors">SPRC</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Southern Punjab Redeemers College - Shaping the Future Through Quality Education
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link 
                to="/admissions" 
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center justify-center shadow-strong hover:shadow-glow transform hover:-translate-y-1 hover:scale-105 group"
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/about" 
                className="border-2 border-white/80 text-white hover:bg-white hover:text-secondary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center justify-center backdrop-blur-sm hover:scale-105"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-primary-600">SPRC</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide world-class education with modern facilities and innovative teaching methods
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="feature-card group text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative z-10">
                  <div className="text-primary-600 group-hover:text-primary-700 mb-6 flex justify-center">
                    <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-mesh"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group hover-scale">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-accent-300 group-hover:text-accent-200 transition-colors">500+</div>
              <div className="text-white/90 font-medium group-hover:text-white transition-colors">Students</div>
            </div>
            <div className="text-center group hover-scale">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-accent-300 group-hover:text-accent-200 transition-colors">25+</div>
              <div className="text-white/90 font-medium group-hover:text-white transition-colors">Faculty Members</div>
            </div>
            <div className="text-center group hover-scale">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-accent-300 group-hover:text-accent-200 transition-colors">10+</div>
              <div className="text-white/90 font-medium group-hover:text-white transition-colors">Years Experience</div>
            </div>
            <div className="text-center group hover-scale">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-accent-300 group-hover:text-accent-200 transition-colors">95%</div>
              <div className="text-white/90 font-medium group-hover:text-white transition-colors">Placement Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Offered */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Programs <span className="text-secondary-600">Offered</span>
            </h2>
            <p className="text-xl text-gray-600">
              Discover our diverse range of academic programs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 border border-gray-100 hover:border-secondary-200 group hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                      <BookOpen className="h-6 w-6 text-secondary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-secondary-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your <span className="text-accent-400">Journey</span>?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join SPRC and become part of a community dedicated to excellence in technology education
          </p>
          <Link 
            to="/login" 
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center shadow-strong hover:shadow-xl transform hover:-translate-y-1"
          >
            Student Portal
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
