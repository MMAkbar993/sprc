import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Departments', path: '/departments' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;
  
  const handleBack = () => {
    navigate(-1);
  };
  
  // Show back button only on portal pages (student, faculty, admin sections)
  const showBackButton = location.pathname.startsWith('/student') || 
                         location.pathname.startsWith('/faculty') || 
                         location.pathname.startsWith('/admin');

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-strong sticky top-0 z-50 border-b border-gray-100 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Back Button */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-110 flex items-center space-x-2 group"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline text-sm font-medium">Back</span>
              </button>
            )}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 rounded-lg group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                {/* <BookOpen className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" /> */}
                <img src="/log.png" alt="SPRC Logo" className="h-20 w-20 text-white group-hover:rotate-12 transition-transform" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-gradient-primary transition-all duration-300">SPRC</h1>
                <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">Southern Punjab Redeemers College</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative group/nav ${
                  isActive(item.path)
                    ? 'text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-soft'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {item.name}
                {!isActive(item.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-primary-300 hover:shadow-soft">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span>{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-strong opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-100 animate-slide-down">
                  <div className="py-1">
                    <Link
                      to={user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/student'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 hover:pl-6"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to={user.role === 'admin' ? '/admin/profile' : user.role === 'faculty' ? '/faculty/profile' : '/student/profile'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 hover:pl-6"
                    >
                      <User className="inline h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 hover:pl-6"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-soft hover:shadow-medium hover:scale-105"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-110"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6 rotate-90 transition-transform" /> : <Menu className="h-6 w-6 transition-transform" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white animate-slide-down">
            <nav className="space-y-2">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 animate-slide-up ${
                    isActive(item.path)
                      ? 'text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-soft'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50 hover:pl-6'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      to={user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/student'}
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to={user.role === 'admin' ? '/admin/profile' : user.role === 'faculty' ? '/faculty/profile' : '/student/profile'}
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 text-center transition-all duration-200 shadow-soft"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
