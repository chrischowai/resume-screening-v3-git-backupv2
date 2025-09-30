
import React from 'react';
import { Button } from './ui/button';
import { Loader2, CheckCircle, RotateCcw, BarChart3, Send } from 'lucide-react';
import { SubmitState } from '../types';

interface ActionButtonsProps {
  submitState: SubmitState;
  canSubmit: boolean;
  canGenerateReport: boolean;
  onSubmit: () => void;
  onGenerateReport: () => void;
  onReset: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  submitState,
  canSubmit,
  canGenerateReport,
  onSubmit,
  onGenerateReport,
  onReset
}) => {
  const getSubmitButtonContent = () => {
    switch (submitState) {
      case 'submitting':
      case 'processing':
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        );
      case 'finished':
        return (
          <>
            <CheckCircle className="h-4 w-4" />
            Completed
          </>
        );
      default:
        return (
          <>
            <Send className="h-4 w-4" />
            Submit
          </>
        );
    }
  };

  const getSubmitButtonVariant = () => {
    switch (submitState) {
      case 'submitting':
      case 'processing':
        return 'submit-processing' as const;
      case 'finished':
        return 'submit-finished' as const;
      default:
        return canSubmit ? 'default' as const : 'submit-disabled' as const;
    }
  };

  const isSubmitDisabled = () => {
    return submitState === 'submitting' || 
           submitState === 'processing' || 
           submitState === 'finished' || 
           !canSubmit;
  };

  return (
    <section className="flex flex-col sm:flex-row gap-6 pt-6">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <Button
          variant={getSubmitButtonVariant()}
          disabled={isSubmitDisabled()}
          onClick={onSubmit}
          className="flex-1 sm:flex-none sm:min-w-[160px] h-12 text-base font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
          aria-describedby="submit-help"
        >
          {getSubmitButtonContent()}
        </Button>

        <Button
          variant="success"
          onClick={onGenerateReport}
          disabled={!canGenerateReport}
          className="flex-1 sm:flex-none sm:min-w-[180px] h-12 text-base font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
          aria-describedby="report-help"
        >
          <BarChart3 className="h-5 w-5" />
          Generate Dashboard
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={onReset}
        className="sm:w-auto h-12 border-2 font-medium transition-all duration-200 hover:border-destructive/50 hover:text-destructive"
        aria-label="Reset all form data"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>

      {/* Screen reader help text */}
      <div className="sr-only">
        <div id="submit-help">
          {!canSubmit && submitState === 'idle' && 
            'Submit button is disabled. Please complete all required fields and ensure scoring total equals 100%.'
          }
        </div>
        <div id="report-help">
          {!canGenerateReport && 
            'Generate Dashboard button is disabled. Dashboard can be generated anytime to load current data from Google Sheets.'
          }
        </div>
      </div>
    </section>
  );
};
