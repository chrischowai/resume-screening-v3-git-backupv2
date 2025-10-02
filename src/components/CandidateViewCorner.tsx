import React, { useState } from 'react';
import { ExternalLink, Award, Lightbulb, X, ChevronRight } from 'lucide-react';
import { CandidateData } from '../services/googleSheets';
import { Badge } from './ui/badge';

interface CandidateViewCornerProps {
  candidate: CandidateData | null;
  onScoreHover?: (show: boolean) => void;
}

const ScoreBreakdown = ({ candidate }: { candidate: CandidateData }) => {
  const formatScoreBreakdown = (breakdown: string) => {
    if (!breakdown || breakdown === 'NA') return null;
    
    // Split by line breaks, semicolons, or bullet points, then filter valid scoring items
    const items = breakdown
      .split(/[\n;]|(?=\s*[•\-\*]\s*)/)
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .filter(item => {
        // Keep items that contain a colon and numbers (scoring format)
        // or items that look like "Category: score/total" format
        return item.includes(':') || /\d+\/\d+/.test(item);
      });
    
    return items.map((item, index) => {
      // Clean up bullet points and numbering but preserve the scoring format
      const cleanItem = item.replace(/^[\d\.\-\*\+•]\s*/, '').trim();
      if (cleanItem.length === 0) return null;
      
      return (
        <div key={index} className="flex items-start gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
          <span className="text-foreground leading-relaxed">{cleanItem}</span>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className="absolute z-10 bg-background border border-border rounded-lg p-4 shadow-lg top-0 left-full ml-2 w-80 max-w-sm">
      <h4 className="font-semibold text-base mb-3 text-foreground">Score Breakdown</h4>
      <div className="text-sm">
        {candidate.score_breakdown && candidate.score_breakdown !== 'NA' ? (
          <div className="space-y-1">
            {formatScoreBreakdown(candidate.score_breakdown)}
          </div>
        ) : (
          <div className="text-muted-foreground">No breakdown available</div>
        )}
      </div>
    </div>
  );
};

export const CandidateViewCorner: React.FC<CandidateViewCornerProps> = ({ candidate, onScoreHover }) => {
  const [showCertInfo, setShowCertInfo] = useState(false);
  const [showQuestionsInfo, setShowQuestionsInfo] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  if (!candidate) {
    return (
      <div className="bg-card border rounded-lg p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm text-center">
          Hover a candidate point to view details
        </p>
      </div>
    );
  }

  const getQualificationColor = (qualification: string) => {
    switch (qualification.toLowerCase()) {
      case 'doctor': return 'bg-red-500 text-white border-red-500';
      case 'master': return 'bg-yellow-500 text-black border-yellow-500';
      case 'degree': return 'bg-green-500 text-white border-green-500';
      case 'below degree': return 'bg-black text-white border-black';
      default: return 'bg-gray-500 text-white border-gray-500';
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg">{candidate.name}</h3>
          <p className="text-sm text-muted-foreground">{candidate.current_job_title}</p>
          <p className="text-sm text-muted-foreground">{candidate.current_company}</p>
        </div>
        {candidate.photo_url && (
          <img 
            src={candidate.photo_url} 
            alt={`${candidate.name} profile`}
            className="w-12 h-12 rounded-full object-cover border-2 border-border"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between relative">
          <span className="text-sm text-muted-foreground">Matching Score:</span>
          <span 
            className="text-lg font-bold text-primary cursor-pointer hover:bg-muted/50 px-1 rounded"
            onMouseEnter={() => {
              setShowScoreBreakdown(true);
              onScoreHover?.(true);
            }}
            onMouseLeave={() => {
              setShowScoreBreakdown(false);
              onScoreHover?.(false);
            }}
          >
            {candidate.matching_score}
          </span>
          {showScoreBreakdown && <ScoreBreakdown candidate={candidate} />}
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Experience:</span>
          <span className="text-sm font-medium">
            {typeof candidate.years_experience === 'number' 
              ? `${candidate.years_experience} years` 
              : candidate.years_experience
            }
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Qualification:</span>
          <Badge className={`text-xs ${getQualificationColor(candidate.qualification)}`}>
            {candidate.qualification}
          </Badge>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Age:</span>
          <span className="text-sm font-medium">{candidate.age}</span>
        </div>

        <div className="flex justify-between items-center relative">
          <div 
            className="flex items-center gap-1 cursor-pointer px-1 rounded bg-pink-50"
            onMouseEnter={() => setShowCertInfo(true)}
            onMouseLeave={() => setShowCertInfo(false)}
          >
            <span className="text-sm text-muted-foreground">Cert and License</span>
            <Award className="h-3 w-3 text-muted-foreground" />
          </div>
          {showCertInfo && candidate.cert_and_license && candidate.cert_and_license !== 'NA' && (
            <div className="absolute z-10 bg-background border border-border rounded-lg p-4 shadow-lg right-0 top-full mt-1 w-80 max-w-sm">
              <h4 className="font-semibold text-base mb-3">Certifications & Licenses</h4>
              <p className="text-sm text-foreground whitespace-pre-wrap">{candidate.cert_and_license}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Language:</span>
          <span className="text-sm font-medium text-right">{candidate.language}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Loyalty:</span>
          <span className="text-sm font-medium text-right whitespace-pre-wrap">{candidate.loyalty}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Expected Salary:</span>
          <span className="text-sm font-medium">{candidate.expected_salary}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Phone:</span>
          <span className="text-sm font-medium">{candidate.phone}</span>
        </div>

        <div className="flex justify-between items-center">
          <button
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded transition-all duration-200 ${
              showQuestionsInfo
                ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border border-yellow-400'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setShowQuestionsInfo(!showQuestionsInfo);
            }}
          >
            <Lightbulb className="h-3 w-3" />
            <span>Reference Questions</span>
            {showQuestionsInfo ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <Lightbulb className="h-3 w-3 opacity-0" />
            )}
          </button>

          {showQuestionsInfo && (
            <button
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuestionsInfo(false);
              }}
            >
              <X className="h-3 w-3" />
              Hide
            </button>
          )}
        </div>

        {showQuestionsInfo && candidate.questions && candidate.questions !== 'NA' && (
          <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm text-foreground">Reference Questions</h4>
              <button
                className="p-1 hover:bg-yellow-100 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuestionsInfo(false);
                }}
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto pr-2">
              <p className="text-sm text-foreground whitespace-pre-wrap">{candidate.questions}</p>
            </div>
          </div>
        )}
      </div>

      {candidate.gdrivelink && (
        <a
          href={candidate.gdrivelink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          View Profile
        </a>
      )}
    </div>
  );
};
