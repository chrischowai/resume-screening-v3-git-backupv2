import { ScoringSchemeRow } from '../types';

export const validateJobTitle = (jobTitle: string): boolean => {
  return jobTitle.trim().length > 0;
};

export const validateNumberOfProfiles = (numberOfProfiles: string): boolean => {
  const num = parseInt(numberOfProfiles, 10);
  return !isNaN(num) && num > 0;
};

export const validateBatch = (batch: string): boolean => {
  const num = parseInt(batch, 10);
  return !isNaN(num) && num > 0 && Number.isInteger(parseFloat(batch));
};

export const calculateScoringTotal = (rows: ScoringSchemeRow[]): number => {
  return rows.reduce((sum, row) => sum + (row.weightPercent || 0), 0);
};

export const isFormValid = (
  jobTitle: string, 
  scoringRows: ScoringSchemeRow[]
): boolean => {
  return (
    validateJobTitle(jobTitle) &&
    Math.abs(calculateScoringTotal(scoringRows) - 100) < 0.001
  );
};