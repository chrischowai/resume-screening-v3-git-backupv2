import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { CandidateScatterPlot } from '../components/CandidateScatterPlot';
import { FilterPanel } from '../components/FilterPanel';
import { KeyMetrics } from '../components/KeyMetrics';
import { CandidateViewCorner } from '../components/CandidateViewCorner';
import { TopCandidatesTable } from '../components/TopCandidatesTable';
import { GoogleSheetsService, CandidateData } from '../services/googleSheets';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Loading Dashboard</h2>
          <p className="text-muted-foreground">Fetching candidate data from Google Sheets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRetry} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Intake
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="bg-pale-orange hover:bg-pale-orange/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Input Page
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-pale-orange hover:bg-pale-orange/80"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Candidate Screening Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Analyze and filter candidate data with interactive visualizations
          </p>
        </header>

        {/* Filters and Key Metrics in same row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Filters (2/3 width) */}
          <div className="lg:col-span-2">
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
          
          {/* Key Metrics (1/3 width) */}
          <div className="lg:col-span-1">
            <KeyMetrics candidates={filteredCandidates} />
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 mb-6">
          {/* Left side - Scatter Plot (65% width) */}
          <div className="lg:col-span-5">
            <div className="bg-card border rounded-lg p-6">
              <CandidateScatterPlot
                data={filteredCandidates}
                loading={false}
                onCandidateHover={handleCandidateHover}
              />
            </div>
          </div>

          {/* Right side - Candidate View (35% width) */}
          <div className="lg:col-span-3">
            <CandidateViewCorner 
              candidate={hoveredCandidate} 
              onScoreHover={(show) => {
                // Optional: Add any additional logic for score hover
              }}
            />
          </div>
        </div>

        {/* Bottom - Top Candidates Table */}
        <div className="mb-6">
          <TopCandidatesTable
            candidates={filteredCandidates}
            onCandidateHover={handleCandidateHover}
          />
        </div>

        {/* No results state */}
        {filteredCandidates.length === 0 && allCandidates.length > 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No candidates match current filters</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filter criteria to see more results.
            </p>
            <Button
              onClick={() => {
                setExperienceRange([0, dataMaxExperience]);
                setMatchingScoreRange([0, dataMaxMatchingScore]);
                setQualification('All');
                setKeyword('');
              }}
              variant="outline"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};