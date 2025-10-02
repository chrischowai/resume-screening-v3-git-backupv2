import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Shield, TrendingUp, Users, BarChart3, Target, Activity, Zap, Globe, Award, Clock, ChevronRight, Building, DollarSign, Filter, Eye, Database, FileText } from 'lucide-react';
import { CandidateScatterPlot } from '../components/CandidateScatterPlot';
import { FilterPanel } from '../components/FilterPanel';
import { KeyMetrics } from '../components/KeyMetrics';
import { CandidateViewCorner } from '../components/CandidateViewCorner';
import { TopCandidatesTable } from '../components/TopCandidatesTable';
import { GoogleSheetsService, CandidateData } from '../services/googleSheets';

// Helper function to format time to English display format
const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = date.getFullYear();

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}_${day.toString().padStart(2, '0')}${month}${year}`;
};

export const DashboardPage: React.FC = () => {
  const [allCandidates, setAllCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 30]);
  const [matchingScoreRange, setMatchingScoreRange] = useState<[number, number]>([0, 100]);
  const [qualification, setQualification] = useState('All');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  
  // Hover state
  const [hoveredCandidate, setHoveredCandidate] = useState<CandidateData | null>(null);
  
  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Debounce keyword search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [keyword]);

  // Filter candidates based on current filters
  const filteredCandidates = useMemo(() => {
    return allCandidates.filter(candidate => {
      // Experience filter
      const expValue = Number(candidate.years_experience) || 0;
      if (expValue < experienceRange[0] || expValue > experienceRange[1]) return false;
      
      // Matching Score filter
      const scoreValue = candidate.matching_score || 0;
      if (scoreValue < matchingScoreRange[0] || scoreValue > matchingScoreRange[1]) return false;
      
      // Qualification filter
      if (qualification !== 'All') {
        if (qualification === 'Degree or above') {
          if (!['Doctor', 'Master', 'Degree'].includes(candidate.qualification)) return false;
        } else if (candidate.qualification !== qualification) {
          return false;
        }
      }
      
      // Keyword filter
      if (debouncedKeyword) {
        const searchText = debouncedKeyword.toLowerCase();
        const candidateText = [
          candidate.name,
          candidate.current_job_title,
          candidate.current_company,
          candidate.industry,
          candidate.key_skills,
          candidate.linkedin_snippet
        ].join(' ').toLowerCase();
        
        // Support multiple keywords (AND logic)
        const keywords = searchText.split(' ').filter(k => k.trim());
        if (!keywords.every(keyword => candidateText.includes(keyword))) return false;
      }
      
      return true;
    });
  }, [allCandidates, experienceRange, matchingScoreRange, qualification, debouncedKeyword]);

  // Get data max experience for slider
  const dataMaxExperience = useMemo(() => {
    return Math.max(...allCandidates.map(c => Number(c.years_experience) || 0), 30);
  }, [allCandidates]);

  // Get data max matching score for slider
  const dataMaxMatchingScore = useMemo(() => {
    return Math.max(...allCandidates.map(c => c.matching_score || 0), 100);
  }, [allCandidates]);

  // Load candidate data
  useEffect(() => {
    const loadCandidateData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Dashboard: Starting to fetch candidate data...');
        const data = await GoogleSheetsService.fetchCandidateData();
        console.log('Dashboard: Received data:', data.length, 'candidates');
        setAllCandidates(data);
        
        // Set initial experience range based on data
        const maxExp = Math.max(...data.map(c => Number(c.years_experience) || 0), 30);
        setExperienceRange([0, Math.min(30, maxExp)]);
        
        // Set initial matching score range
        const maxScore = Math.max(...data.map(c => c.matching_score || 0), 100);
        setMatchingScoreRange([0, maxScore]);
      } catch (err) {
        setError('Failed to load candidate data');
        console.error('Error loading candidate data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCandidateData();
  }, []);

  // Clear hovered candidate if it's no longer in filtered results
  useEffect(() => {
    if (hoveredCandidate && !filteredCandidates.includes(hoveredCandidate)) {
      setHoveredCandidate(null);
    }
  }, [filteredCandidates, hoveredCandidate]);

  const handleGoBack = () => {
    window.location.href = '/';
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await GoogleSheetsService.fetchCandidateData();
      setAllCandidates(data);
      
      // Reset filters to show all new data
      const maxExp = Math.max(...data.map(c => Number(c.years_experience) || 0), 30);
      const maxScore = Math.max(...data.map(c => c.matching_score || 0), 100);
      setExperienceRange([0, Math.min(30, maxExp)]);
      setMatchingScoreRange([0, maxScore]);
      setQualification('All');
      setKeyword('');
    } catch (err) {
      setError('Failed to refresh candidate data');
      console.error('Error refreshing candidate data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Handler for filter changes
  const handleExperienceRangeChange = useCallback((value: [number, number]) => {
    setExperienceRange(value);
  }, []);

  const handleMatchingScoreRangeChange = useCallback((value: [number, number]) => {
    setMatchingScoreRange(value);
  }, []);

  const handleQualificationChange = useCallback((value: string) => {
    setQualification(value);
  }, []);

  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value);
  }, []);

  const handleCandidateHover = useCallback((candidate: CandidateData | null) => {
    setHoveredCandidate(candidate);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 relative">
        {/* Background patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-3xl shadow-2xl shadow-primary/10 p-12 max-w-md mx-auto">
            <div className="text-center space-y-6">
              {/* Animated logo/icon */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover rounded-2xl animate-pulse opacity-20"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
                  <Shield className="w-12 h-12 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full border-3 border-white animate-ping"></div>
              </div>

              {/* Loading animation */}
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                    Initializing Executive Dashboard
                  </h2>
                  <div className="flex items-center justify-center space-x-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">Synchronizing candidate intelligence database...</p>
                  </div>
                </div>

                {/* Progress indicators */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data Retrieval</span>
                    <span className="text-primary font-medium">Active</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-primary-hover h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Secure Connection</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>Real-time Sync</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-100/20 relative">
        {/* Background patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-md border border-red-200/50 rounded-3xl shadow-2xl shadow-red-500/10 p-12 max-w-md mx-auto">
            <div className="text-center space-y-6">
              {/* Error icon with animation */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-red-100 rounded-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-red-50 rounded-2xl flex items-center justify-center border-2 border-red-200">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-3 border-white animate-ping"></div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-red-800">Dashboard Initialization Failed</h2>
                <div className="space-y-2">
                  <p className="text-red-600 font-medium">System encountered an error while loading candidate intelligence</p>
                  <p className="text-muted-foreground text-sm">{error}</p>
                </div>

                {/* Error details */}
                <div className="bg-red-50/50 border border-red-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700 font-medium">Connection Status</span>
                    <span className="text-red-500">Disconnected</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700 font-medium">Data Source</span>
                    <span className="text-red-500">Google Sheets API</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleRetry}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-red-600/20 transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reconnect System
                  </Button>
                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 font-semibold transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Intake
                  </Button>
                </div>

                <div className="flex items-center justify-center space-x-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Error ID: DSH-001</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 relative">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-8xl relative z-10">
        {/* Dashboard Header */}
        <header className="mb-8">
          <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-2 bg-gradient-to-r from-primary via-primary-hover to-primary"></div>

            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                {/* Left side - Title */}
                <div className="flex items-center space-x-5">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-primary/30">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent tracking-tight">
                    TalentScreen Dashboard
                  </h1>
                </div>

                {/* Right side - Action buttons */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleGoBack}
                      className="h-11 px-6 font-semibold bg-white/80 border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Previous Page
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="h-11 px-6 font-semibold bg-white/80 border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm hover:shadow-primary/20 backdrop-blur-sm"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      {refreshing ? 'Syncing...' : 'Refresh Data'}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Latest Updated: {formatTime(new Date())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Analytics Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Advanced Filters (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Filter className="w-5 h-5 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Intelligent Filtering System</h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Advanced candidate search and segmentation</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-primary/5 rounded-lg">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">ACTIVE</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-b from-white/50 to-transparent">
                <FilterPanel
                  experienceRange={experienceRange}
                  matchingScoreRange={matchingScoreRange}
                  qualification={qualification}
                  keyword={keyword}
                  onExperienceRangeChange={handleExperienceRangeChange}
                  onMatchingScoreRangeChange={handleMatchingScoreRangeChange}
                  onQualificationChange={handleQualificationChange}
                  onKeywordChange={handleKeywordChange}
                  dataMaxExperience={dataMaxExperience}
                  dataMaxMatchingScore={dataMaxMatchingScore}
                />
              </div>
            </div>
          </div>

          {/* Executive Metrics (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30">
              <div className="bg-gradient-to-r from-success/10 via-success/5 to-transparent px-6 py-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-success/20 to-success/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="w-5 h-5 text-success" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Performance Metrics</h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Real-time analytics insights</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-b from-white/50 to-transparent">
                <KeyMetrics candidates={filteredCandidates} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 mb-8">
          {/* Candidate Intelligence Visualization (65% width) */}
          <div className="lg:col-span-5">
            <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30">
              <div className="bg-gradient-to-r from-blue-600/10 via-blue-600/5 to-transparent px-6 py-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600/20 to-blue-600/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Candidate Intelligence Matrix</h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Experience vs. Matching Score analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-blue-600">LIVE</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-b from-white/50 to-transparent">
                <CandidateScatterPlot
                  data={filteredCandidates}
                  loading={false}
                  onCandidateHover={handleCandidateHover}
                />
              </div>
            </div>
          </div>

          {/* Candidate Profile (35% width) */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30">
              <div className="bg-gradient-to-r from-purple-600/10 via-purple-600/5 to-transparent px-6 py-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600/20 to-purple-600/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Eye className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Candidate Profile</h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">Detailed candidate insights</p>
                    </div>
                  </div>
                  {hoveredCandidate && (
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600/10 rounded-lg">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600">SELECTED</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 bg-gradient-to-b from-white/50 to-transparent">
                <CandidateViewCorner
                  candidate={hoveredCandidate}
                  onScoreHover={(show) => {
                    // Optional: Add any additional logic for score hover
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Executive Candidate Rankings */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30">
            <div className="bg-gradient-to-r from-emerald-600/10 via-emerald-600/5 to-transparent px-6 py-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600/20 to-emerald-600/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Candidate Summary Table</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      Candidate overview analysis • {filteredCandidates.length} candidates evaluated
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-b from-white/50 to-transparent">
              <TopCandidatesTable
                candidates={filteredCandidates}
                onCandidateHover={handleCandidateHover}
              />
            </div>
          </div>
        </div>

        {/* No Results State */}
        {filteredCandidates.length === 0 && allCandidates.length > 0 && (
          <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl shadow-primary/5 p-12">
            <div className="text-center space-y-6">
              {/* Search icon with animation */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-30"></div>
                <div className="relative w-full h-full bg-yellow-50 rounded-full flex items-center justify-center border-2 border-yellow-200">
                  <Filter className="w-12 h-12 text-yellow-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full border-3 border-white animate-ping"></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">No Candidates Match Current Criteria</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground text-lg">
                    The intelligent filtering system couldn't find any candidates that match your current search parameters.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your filter criteria to expand the search results.
                  </p>
                </div>

                {/* Filter summary */}
                <div className="bg-yellow-50/50 border border-yellow-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700 font-medium">Experience Range</span>
                    <span className="text-yellow-600">
                      {experienceRange[0]} - {experienceRange[1]} years
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700 font-medium">Matching Score</span>
                    <span className="text-yellow-600">
                      {matchingScoreRange[0]}% - {matchingScoreRange[1]}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-700 font-medium">Qualification</span>
                    <span className="text-yellow-600">{qualification}</span>
                  </div>
                  {keyword && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-yellow-700 font-medium">Keywords</span>
                      <span className="text-yellow-600">{keyword}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setExperienceRange([0, dataMaxExperience]);
                      setMatchingScoreRange([0, dataMaxMatchingScore]);
                      setQualification('All');
                      setKeyword('');
                    }}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-yellow-600/20 transition-all duration-200 px-8 py-3"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset All Filters
                  </Button>

                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 font-semibold transition-all duration-200 px-8 py-3"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Strategy
                  </Button>
                </div>

                {/* Help text */}
                <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Need assistance?</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Try broader criteria</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};