import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Users, TrendingUp, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 flex">
      {/* Left Side - Professional Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-hover relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Resume Screening Tool
              </h1>
            </div>
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              Advanced talent acquisition platform designed for modern HR professionals and consultants
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Intelligent Candidate Matching</h3>
                <p className="text-white/80 text-sm">AI-powered resume analysis with customizable scoring criteria</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Data-Driven Insights</h3>
                <p className="text-white/80 text-sm">Comprehensive analytics and reporting for informed hiring decisions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Streamlined Workflow</h3>
                <p className="text-white/80 text-sm">Efficient process from job posting to candidate selection</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                Resume Screening Tool
              </h1>
            </div>
            <p className="text-muted-foreground">Professional talent acquisition platform</p>
          </div>
          
          <Card className="border-0 shadow-2xl shadow-primary/5 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Please enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 px-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="loginName" className="text-sm font-medium text-foreground">
                    Login Name
                  </Label>
                  <Input
                    id="loginName"
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="Enter your login name"
                    disabled={isLoading}
                    required
                    className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    required
                    className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                    <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-hover focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-lg shadow-primary/25" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </Button>
              </form>
              
              {/* Security Note */}
              <div className="mt-6 pt-6 border-t border-border/30">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  <Shield className="inline w-3 h-3 mr-1" />
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};