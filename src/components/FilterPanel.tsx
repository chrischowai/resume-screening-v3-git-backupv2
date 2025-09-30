import React from 'react';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface FilterPanelProps {
  experienceRange: [number, number];
  matchingScoreRange: [number, number];
  qualification: string;
  keyword: string;
  onExperienceRangeChange: (value: [number, number]) => void;
  onMatchingScoreRangeChange: (value: [number, number]) => void;
  onQualificationChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  dataMaxExperience: number;
  dataMaxMatchingScore: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  experienceRange,
  matchingScoreRange,
  qualification,
  keyword,
  onExperienceRangeChange,
  onMatchingScoreRangeChange,
  onQualificationChange,
  onKeywordChange,
  dataMaxExperience,
  dataMaxMatchingScore
}) => {
  const displayMaxExperience = Math.min(30, dataMaxExperience);
  const displayMaxMatchingScore = Math.min(100, dataMaxMatchingScore);

  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Experience Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Experience: {experienceRange[0]}-{experienceRange[1]} years
          </label>
          <Slider
            value={experienceRange}
            onValueChange={(value) => onExperienceRangeChange([value[0], value[1]])}
            max={displayMaxExperience}
            min={0}
            step={1}
            className="w-full"
            aria-label="Experience range filter"
          />
        </div>

        {/* Matching Score Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Matching Score: {matchingScoreRange[0]}-{matchingScoreRange[1]}%
          </label>
          <Slider
            value={matchingScoreRange}
            onValueChange={(value) => onMatchingScoreRangeChange([value[0], value[1]])}
            max={displayMaxMatchingScore}
            min={0}
            step={1}
            className="w-full [&_.bg-primary]:bg-purple-500 [&_[data-state]]:border-purple-500"
            aria-label="Matching score range filter"
          />
        </div>

        {/* Qualification Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Qualification
          </label>
          <Select value={qualification} onValueChange={onQualificationChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Qualifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Qualifications</SelectItem>
              <SelectItem value="Degree or above">Degree or above</SelectItem>
              <SelectItem value="Doctor">Doctor</SelectItem>
              <SelectItem value="Master">Master</SelectItem>
              <SelectItem value="Degree">Degree</SelectItem>
              <SelectItem value="Below Degree">Below Degree</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Keyword Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Keyword Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search skills, companies, titles..."
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="pl-10"
              aria-label="Keyword search"
            />
          </div>
        </div>
      </div>
    </div>
  );
};