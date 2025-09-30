
import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2, Plus } from 'lucide-react';
import { ScoringSchemeRow } from '../types';

interface ScoringTableProps {
  rows: ScoringSchemeRow[];
  total: number;
  totalStatus: 'valid' | 'over' | 'under';
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onUpdateRow: (id: string, field: keyof ScoringSchemeRow, value: string | number) => void;
}

export const ScoringTable: React.FC<ScoringTableProps> = ({
  rows,
  total,
  totalStatus,
  onAddRow,
  onDeleteRow,
  onUpdateRow
}) => {
  const totalColorClass = {
    valid: 'text-success font-semibold',
    over: 'text-destructive font-semibold',
    under: 'text-warning font-semibold'
  }[totalStatus];

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <Label className="text-xl font-semibold text-foreground">Key Areas & Scoring Scheme</Label>
        <p className="text-sm text-muted-foreground leading-relaxed">
          (Enter the key areas looking for and its weighting of importance, a "Matching score" will be generated for reference.)
        </p>
        
        {totalStatus !== 'valid' && (
          <div className="text-sm text-muted-foreground bg-warning/10 border border-warning/20 rounded-lg p-4" role="alert">
            <div className="flex items-center gap-2">
              <span className="text-warning">⚠️</span>
              <span>Total weight must equal exactly 100%. Current total: <strong>{total.toFixed(1)}%</strong></span>
            </div>
          </div>
        )}
      </div>

      <div className="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-primary/5 border-b border-border/30">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-foreground">Key Area</th>
                <th className="text-left px-6 py-4 font-semibold text-foreground">Weight %</th>
                <th className="text-center px-6 py-4 font-semibold text-foreground w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-border/20 hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4">
                    <Input
                      value={row.areaName}
                      onChange={(e) => onUpdateRow(row.id, 'areaName', e.target.value)}
                      placeholder="Enter key area name"
                      className="border-0 shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                      aria-label={`Key area name for row ${index + 1}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={row.weightPercent || ''}
                      onChange={(e) => onUpdateRow(row.id, 'weightPercent', parseFloat(e.target.value) || 0)}
                      className="border-0 shadow-none p-0 h-auto focus-visible:ring-0 w-24 bg-transparent"
                      aria-label={`Weight percentage for ${row.areaName || `row ${index + 1}`}`}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteRow(row.id)}
                      disabled={rows.length <= 1}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Delete ${row.areaName || `row ${index + 1}`}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              
              {/* Total Row */}
              <tr className="border-t-2 border-primary/20 bg-primary/5">
                <td className="px-6 py-4 font-bold text-foreground">Total:</td>
                <td className="px-6 py-4">
                  <span className={totalColorClass}>
                    {total.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onAddRow}
        className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/10"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Row
      </Button>
    </section>
  );
};
