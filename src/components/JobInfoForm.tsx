import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { validateJobTitle } from '../utils/validation';

interface JobInfoFormProps {
  jobTitle: string;
  onJobTitleChange: (value: string) => void;
}

export const JobInfoForm: React.FC<JobInfoFormProps> = ({
  jobTitle,
  onJobTitleChange
}) => {
  const jobTitleValid = validateJobTitle(jobTitle);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="job-title" className="text-lg font-bold">
          Job Title
        </Label>
        <Input
          id="job-title"
          type="text"
          placeholder="e.g. HR Manager"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          className={`w-full ${!jobTitleValid && jobTitle ? 'border-destructive' : ''}`}
          aria-describedby={!jobTitleValid && jobTitle ? 'job-title-error' : undefined}
        />
        {!jobTitleValid && jobTitle && (
          <p id="job-title-error" className="text-sm text-destructive" role="alert">
            Job title is required
          </p>
        )}
      </div>
    </section>
  );
};