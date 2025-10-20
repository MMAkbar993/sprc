import React from 'react';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 text-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* College Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4 group">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                <BookOpen className="h-8 w-8 text-white group-hover:rotate-12 transition-transform" />
              </div>
              <div>
                <h3 className="text-lg font-bold group-hover:text-accent-200 transition-colors">Southern Punjab Redeemers College</h3>
                <p className="text-white/80 text-sm">Affiliated with Ghazi University, DG Khan</p>
              </div>
            </div>
            <p className="text-white/90 mb-4 leading-relaxed hover:text-white transition-colors">
              Committed to providing quality education and fostering innovation. The institution provides students 
              with quality education and grooms them to face life with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent-300 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-accent-400 to-accent-500 rounded-full mr-2"></div>
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li><a href="/about" className="text-white/80 hover:text-accent-300 transition-all duration-300 hover:pl-2 inline-block">About Us</a></li>
              <li><a href="/departments" className="text-white/80 hover:text-accent-300 transition-all duration-300 hover:pl-2 inline-block">Departments</a></li>
              <li><a href="/admissions" className="text-white/80 hover:text-accent-300 transition-all duration-300 hover:pl-2 inline-block">Admissions</a></li>
              <li><a href="/student" className="text-white/80 hover:text-accent-300 transition-all duration-300 hover:pl-2 inline-block">Student Portal</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-accent-300 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-accent-400 to-accent-500 rounded-full mr-2"></div>
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-2 group hover:pl-2 transition-all duration-300">
                <MapPin className="h-4 w-4 text-accent-300 group-hover:scale-110 transition-transform mt-0.5" />
                <span className="text-white/80 text-sm group-hover:text-white transition-colors">New College Road, near Boys Degree College<br/>Taunsa Housing Colony, Taunsa, DG Khan</span>
              </div>
              <div className="flex items-center space-x-2 group hover:pl-2 transition-all duration-300">
                <Phone className="h-4 w-4 text-accent-300 group-hover:scale-110 transition-transform" />
                <span className="text-white/80 text-sm group-hover:text-white transition-colors">0337-7079560 | 064-2601432</span>
              </div>
              <div className="flex items-center space-x-2 group hover:pl-2 transition-all duration-300">
                <Mail className="h-4 w-4 text-accent-300 group-hover:scale-110 transition-transform" />
                <span className="text-white/80 text-sm group-hover:text-white transition-colors">spt.redeemers@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/90 text-sm font-medium hover:text-white transition-colors">
            © 2023 SPRC All Rights Reserved.
          </p>
          <p className="text-white/70 text-xs mt-2 hover:text-white/90 transition-colors">
            Developed by M M Akbar
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
