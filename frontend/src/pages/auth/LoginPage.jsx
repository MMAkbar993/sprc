import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();

  if (user) {
    const redirectPath = user.role === 'admin' ? '/admin' : 
                        user.role === 'faculty' ? '/faculty' : '/student';
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center animate-slide-down">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-soft hover:shadow-glow animate-bounce-slow hover:scale-110 transition-all duration-300">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SPRC Portal</h1>
              <p className="text-sm text-gray-600">Student, Faculty & Admin Login</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gradient">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access the portal
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 animate-fade-in" onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4 hover:shadow-card-hover transition-all duration-300">
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field pl-10"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary-600 transition-all duration-300 hover:scale-110"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-gradient-to-r from-red-50 to-red-100/50 p-4 rounded-lg border border-red-200 shadow-soft animate-scale-in">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-soft hover:shadow-glow hover:scale-105 active:scale-100"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <span className="flex items-center">
                  Sign In
                  <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </div>

          <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link 
              to="/" 
              className="text-primary-600 hover:text-primary-500 text-sm font-medium transition-all duration-300 inline-flex items-center hover:scale-105"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
