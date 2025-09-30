import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from 'recharts';
import { ChartContainer } from './ui/chart';
import { CandidateData } from '../services/googleSheets';

interface CandidateScatterPlotProps {
  data: CandidateData[];
  loading?: boolean;
  onCandidateHover?: (candidate: CandidateData | null) => void;
}

const CustomTooltip = ({ active, payload, onCandidateHover }: TooltipProps<number, string> & { onCandidateHover?: (candidate: CandidateData | null) => void }) => {
  React.useEffect(() => {
    if (active && payload && payload.length && onCandidateHover) {
      const data = payload[0].payload as CandidateData;
      onCandidateHover(data);
    }
  }, [active, payload, onCandidateHover]);

  if (active && payload && payload.length) {
    const data = payload[0].payload as any;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg z-50">
        <h4 className="font-semibold text-foreground mb-2">{data.name}</h4>
        <div className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Title:</span> {data.current_job_title}</p>
          <p><span className="text-muted-foreground">Company:</span> {data.current_company}</p>
          <p><span className="text-muted-foreground">Matching Score:</span> {Math.round(data.original_matching_score || data.matching_score)}%</p>
          <p><span className="text-muted-foreground">Experience:</span> {Math.round(data.original_years_experience || data.years_experience)} years</p>
          <p><span className="text-muted-foreground">Qualification:</span> {data.qualification}</p>
        </div>
      </div>
    );
  }
  return null;
};

const getQualificationColor = (qualification: string): string => {
  switch (qualification.toLowerCase()) {
    case 'doctor': return '#FF0000';
    case 'master': return '#FFD400';
    case 'degree': return '#00A542';
    case 'below degree': return '#000000';
    default: return '#000000';
  }
};

export const CandidateScatterPlot: React.FC<CandidateScatterPlotProps> = ({ 
  data, 
  loading = false,
  onCandidateHover
}) => {
  const chartConfig = {
    years_experience: {
      label: "Years of Experience",
      color: "hsl(var(--primary))",
    },
    matching_score: {
      label: "Matching Score (%)",
      color: "hsl(var(--primary))",
    },
  };

  // Add stable small jitter to prevent overlapping points but keep original values for tooltip
  const processedData = React.useMemo(() => data.map((candidate, index) => ({
    ...candidate,
    years_experience: Math.round((Number(candidate.years_experience) || 0) + (index % 3 - 1) * 0.1),
    matching_score: Math.round(candidate.matching_score + (index % 5 - 2) * 0.1),
    // Store original values for tooltip
    original_years_experience: Math.round(Number(candidate.years_experience) || 0),
    original_matching_score: Math.round(candidate.matching_score),
  })), [data]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading candidate data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold mb-2">Candidate Pool Overview</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Mouse hovers over points to see candidate details
        </p>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF0000' }}></div>
            <span>Doctor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFD400' }}></div>
            <span>Master</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00A542' }}></div>
            <span>Degree</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#000000' }}></div>
            <span>Below Degree</span>
          </div>
        </div>
      </div>
      
      <ChartContainer config={chartConfig} className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            data={processedData}
            margin={{
              top: 20,
              right: 20,
              bottom: 40,
              left: 60,
            }}
            onMouseMove={(e) => {
              if (e && e.activePayload && e.activePayload.length > 0 && onCandidateHover) {
                const candidate = e.activePayload[0].payload as CandidateData;
                onCandidateHover(candidate);
              }
            }}
           
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="years_experience"
              name="Years of Experience"
              domain={[0, 25]}
              ticks={[0, 5, 10, 15, 20, 25]}
              tick={{ fontSize: 12, fill: '#666' }}
              label={{ value: 'Experience', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: 12, fill: '#666', fontWeight: 'bold' } }}
            />
            <YAxis
              type="number"
              dataKey="matching_score"
              name="Matching Score"
              domain={[0, 100]}
              tickCount={11}
              tick={{ fontSize: 12, fill: '#666' }}
              label={{ value: 'Matching Score', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#666', fontWeight: 'bold' } }}
            />
            <Tooltip
              content={<CustomTooltip onCandidateHover={onCandidateHover} />}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Scatter
              name="Candidates"
              data={processedData}
            >
              {processedData.map((candidate, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getQualificationColor(candidate.qualification)}
                  stroke={getQualificationColor(candidate.qualification)}
                  strokeWidth={1}
                  r={5}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
