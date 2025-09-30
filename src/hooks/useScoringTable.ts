
import { useState, useCallback } from 'react';
import { ScoringSchemeRow } from '../types';
import { calculateScoringTotal } from '../utils/validation';

const generateId = () => `scoring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_ROWS: ScoringSchemeRow[] = [
  { id: generateId(), areaName: 'Experience', weightPercent: 20 },
  { id: generateId(), areaName: 'Academic Qualification', weightPercent: 20 },
  { id: generateId(), areaName: 'Industry Match', weightPercent: 20 },
  { id: generateId(), areaName: 'JD Match', weightPercent: 20 },
  { id: generateId(), areaName: 'Certification', weightPercent: 20 }
];

export const useScoringTable = () => {
  const [rows, setRows] = useState<ScoringSchemeRow[]>(DEFAULT_ROWS);

  const addRow = useCallback(() => {
    const newRow: ScoringSchemeRow = {
      id: generateId(),
      areaName: '',
      weightPercent: 0
    };
    setRows(prev => [...prev, newRow]);
  }, []);

  const deleteRow = useCallback((id: string) => {
    setRows(prev => {
      // Prevent deleting if only one row remains
      if (prev.length <= 1) return prev;
      return prev.filter(row => row.id !== id);
    });
  }, []);

  const updateRow = useCallback((id: string, field: keyof ScoringSchemeRow, value: string | number) => {
    setRows(prev => prev.map(row => 
      row.id === id 
        ? { ...row, [field]: value }
        : row
    ));
  }, []);

  const resetRows = useCallback(() => {
    setRows(DEFAULT_ROWS.map(row => ({ ...row, id: generateId() })));
  }, []);

  const total = calculateScoringTotal(rows);

  const getTotalStatus = (): 'valid' | 'over' | 'under' => {
    if (Math.abs(total - 100) < 0.001) return 'valid';
    if (total > 100) return 'over';
    return 'under';
  };

  return {
    rows,
    total,
    totalStatus: getTotalStatus(),
    addRow,
    deleteRow,
    updateRow,
    resetRows
  };
};
