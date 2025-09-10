import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Eye, EyeOff, ArrowRight, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { validateEmail, validatePassword } from '../utils/validation';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    
    // Client-side validation
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    const newValidationErrors: {[key: string]: string} = {};
    if (emailError) newValidationErrors[emailError.field] = emailError.message;
    if (passwordError) newValidationErrors[passwordError.field] = passwordError.message;
    
    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      return;
    }
    
    setIsLoading(true);
    const success = await login(email, password);
    
    if (!success) {
      setError('Invalid email or password. Please check your credentials and try again.');
    }
    
    setIsLoading(false);
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear validation error when user starts typing
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear validation error when user starts typing
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <Wrench className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
            WorkShop Pro
          </h1>
          <p className="text-blue-200 text-lg font-medium">Workshop Management System</p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mt-4"></div>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Secure Login</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-400 ${
                  validationErrors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter your email"
                required
              />
              {validationErrors.email && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{validationErrors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-400 ${
                    validationErrors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.password && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{validationErrors.password}</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
                <p className="text-red-600 text-sm font-medium flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-blue-200 font-medium">
            Workshop Management System - MongoDB Atlas Authentication
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-blue-300">
            <span className="flex items-center">
              <div className="w-1 h-1 bg-blue-400 rounded-full mr-1"></div>
              Secure
            </span>
            <span className="flex items-center">
              <div className="w-1 h-1 bg-blue-400 rounded-full mr-1"></div>
              Fast
            </span>
            <span className="flex items-center">
              <div className="w-1 h-1 bg-blue-400 rounded-full mr-1"></div>
              Reliable
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;