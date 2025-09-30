import React from 'react';
import { Users, Target, Clock } from 'lucide-react';
import { CandidateData } from '../services/googleSheets';

interface KeyMetricsProps {
  candidates: CandidateData[];
}

export const KeyMetrics: React.FC<KeyMetricsProps> = ({ candidates }) => {
  const totalCandidates = candidates.length;
  const avgMatchingScore = totalCandidates > 0 
    ? Math.round(candidates.reduce((sum, c) => sum + c.matching_score, 0) / totalCandidates)
    : '—';
  const avgExperience = totalCandidates > 0 
    ? Math.round(candidates.reduce((sum, c) => sum + (Number(c.years_experience) || 0), 0) / totalCandidates)
    : '—';

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="text-center p-3 bg-background border rounded-lg">
        <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
        <div className="text-lg font-bold text-foreground">{totalCandidates}</div>
        <div className="text-xs text-muted-foreground">Total Candidates</div>
      </div>
      
      <div className="text-center p-3 bg-background border rounded-lg">
        <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
        <div className="text-lg font-bold text-foreground">{avgMatchingScore}%</div>
        <div className="text-xs text-muted-foreground">Avg Matching Score</div>
      </div>
      
      <div className="text-center p-3 bg-background border rounded-lg">
        <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
        <div className="text-lg font-bold text-foreground">{avgExperience}</div>
        <div className="text-xs text-muted-foreground">Avg Years Experience</div>
      </div>
    </div>
  );
};