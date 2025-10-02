import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Users, BarChart3 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginName.trim() || !password.trim()) {
      setError('Please enter both login name and password');
      return;
    }

    const result = await login(loginName, password);

    if (result.success) {
      navigate('/intake');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGgxNHYxNEgzNnptMTQgMEgzNnYtMTRoMTR6IiBmaWxsPSIjZjNmNGY2IiBvcGFjaXR5PSIuMDUiLz48cGF0aCBkPSJNMCAwaDYwdjYwSDB6IiBmaWxsPSJub25lIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>

      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Introduction Content */}
            <div className="text-white space-y-8">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">TalentScreen Pro</h1>
                  <p className="text-blue-100 font-medium">AI-Powered Resume Screening</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                  Secure Access to Advanced Resume Analysis
                </h2>
                <p className="text-lg lg:text-xl text-blue-100 leading-relaxed">
                  Experience the future of candidate evaluation with our AI-driven screening platform.
                  Make data-driven hiring decisions with confidence and precision.
                </p>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg flex-shrink-0">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Advanced Analytics</h3>
                      <p className="text-blue-100 text-sm">Comprehensive candidate scoring and insights</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg flex-shrink-0">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Smart Screening</h3>
                      <p className="text-blue-100 text-sm">AI-powered resume analysis and matching</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg flex-shrink-0">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Enterprise Security</h3>
                      <p className="text-blue-100 text-sm">Bank-level encryption and data protection</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quote */}
              <blockquote className="text-blue-100 italic text-lg border-l-4 border-blue-300 pl-4">
                "Transforming hiring through intelligent technology and human expertise."
              </blockquote>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                  {/* Header */}
                  <div className="bg-white/80 backdrop-blur-sm px-6 py-8 text-center border-b border-white/20">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg mb-4">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                      Welcome Back
                    </h2>
                    <p className="text-slate-600 text-sm">
                      Sign in to access your resume screening dashboard
                    </p>
                  </div>

                  {/* Form Content */}
                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="loginName"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Login Name
                        </Label>
                        <div className="relative">
                          <Input
                            id="loginName"
                            type="text"
                            value={loginName}
                            onChange={(e) => setLoginName(e.target.value)}
                            placeholder="Enter your login name"
                            disabled={isLoading}
                            required
                            className="
                              w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl
                              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                              transition-all duration-200 bg-white/90 backdrop-blur-sm
                              hover:border-slate-300
                            "
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            required
                            className="
                              w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl
                              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                              transition-all duration-200 bg-white/90 backdrop-blur-sm
                              hover:border-slate-300
                            "
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4" role="alert">
                          <div className="flex items-center space-x-3">
                            <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                              <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-red-800">Authentication Error</p>
                              <p className="text-sm text-red-600 break-words">{error}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="
                          w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900
                          text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200
                          shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                          disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                        "
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Sign In Securely
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Additional Info */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="flex items-center justify-center space-x-4 text-xs text-slate-600">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Secure Connection</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Enterprise Grade</span>
                        </div>
                      </div>
                      <p className="text-center text-xs text-slate-500 mt-3">
                        Protected by advanced encryption and security protocols
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};