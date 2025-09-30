import React, { useState, useCallback } from 'react';
import { JobInfoForm } from '../components/JobInfoForm';
import { ScoringTable } from '../components/ScoringTable';
import { FileUpload } from '../components/FileUpload';
import { ResumeUpload } from '../components/ResumeUpload';
import { ActionButtons } from '../components/ActionButtons';
import { Toast } from '../components/Toast';
import { useScoringTable } from '../hooks/useScoringTable';
import { FileUpload as FileUploadType, SubmitState } from '../types';
import { isFormValid } from '../utils/validation';
import { submitIntakeForm } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
const INITIAL_FILE_UPLOAD: FileUploadType = {
  file: null,
  fileName: null,
  mimeType: null,
  contentFormat: 'none',
  content: null
};
export const IntakePage: React.FC = () => {
  const {
    logout
  } = useAuth();

  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [fileUpload, setFileUpload] = useState<FileUploadType>(INITIAL_FILE_UPLOAD);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);

  // Submit state
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  // Workflow completion state
  const [workflowCompleted, setWorkflowCompleted] = useState(false);
  const [workflowMessage, setWorkflowMessage] = useState<string>('');

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Scoring table
  const scoringTable = useScoringTable();

  // Form validation
  const canSubmit = isFormValid(jobTitle, scoringTable.rows) && scoringTable.totalStatus === 'valid' && resumeFiles.length > 0;
  const canGenerateReport = true; // Allow dashboard generation anytime

  // Handlers
  const handleSubmit = useCallback(async () => {
    if (!canSubmit || submitState !== 'idle') return;
    setSubmitState('submitting');
    setWorkflowMessage('Processing...');
    try {
      const formData = {
        jobTitle,
        numberOfProfiles: resumeFiles.length,
        batch: 1,
        // Default batch number
        scoringScheme: scoringTable.rows,
        jdDocument: fileUpload,
        resumeFiles: resumeFiles
      };
      setSubmitState('processing');
      const result = await submitIntakeForm(formData);
      console.log('Submission successful:', result);
      setSubmitState('finished');
      setWorkflowCompleted(true);
      setWorkflowMessage('Workflow completed! You could now start generating the Dashboard. OR You could visit the candidate database via this LINK:');

      // Show success toast
      setToast({
        message: result?.message || 'Submitted successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitState('error');
      setWorkflowMessage('');

      // Show error toast
      setToast({
        message: 'Submission failed. Please try again.',
        type: 'error'
      });
    }
  }, [canSubmit, submitState, jobTitle, scoringTable.rows, fileUpload, resumeFiles]);
  const handleGenerateReport = useCallback(() => {
    // Navigate to dashboard - in a real app this would use router
    window.location.href = '/dashboard';
  }, []);
  const handleReset = useCallback(() => {
    const confirmed = window.confirm('Reset all inputs? This action cannot be undone.');
    if (confirmed) {
      setJobTitle('');
      setFileUpload(INITIAL_FILE_UPLOAD);
      setResumeFiles([]);
      setSubmitState('idle');
      setWorkflowCompleted(false);
      setWorkflowMessage('');
      setToast(null);
      scoringTable.resetRows();
    }
  }, [scoringTable]);
  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  // Reset submit state when form data changes (for error state)
  React.useEffect(() => {
    if (submitState === 'error') {
      setSubmitState('idle');
    }
  }, [jobTitle, scoringTable.rows, fileUpload, resumeFiles, submitState]);
  return <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-primary mb-4">
                  Resume Screening Tool
                </h1>
                <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
              </div>
              <Button variant="outline" onClick={logout} className="text-sm font-extrabold bg-gray-500 hover:bg-gray-400 text-gray-100">
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Form */}
        <main className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden">
          <div className="p-8 space-y-10">
            <JobInfoForm jobTitle={jobTitle} onJobTitleChange={setJobTitle} />

            <div className="border-t border-border/30 pt-8">
              <ScoringTable rows={scoringTable.rows} total={scoringTable.total} totalStatus={scoringTable.totalStatus} onAddRow={scoringTable.addRow} onDeleteRow={scoringTable.deleteRow} onUpdateRow={scoringTable.updateRow} />
            </div>

            <div className="border-t border-border/30 pt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FileUpload fileUpload={fileUpload} onFileSelect={setFileUpload} onFileRemove={() => setFileUpload(INITIAL_FILE_UPLOAD)} />
                <ResumeUpload resumeFiles={resumeFiles} onFilesSelect={setResumeFiles} onFilesRemove={() => setResumeFiles([])} />
              </div>
            </div>

            <div className="border-t border-border/30 pt-6">
              <ActionButtons submitState={submitState} canSubmit={canSubmit} canGenerateReport={canGenerateReport} onSubmit={handleSubmit} onGenerateReport={handleGenerateReport} onReset={handleReset} />
              
              {/* Status Message Bar */}
              {workflowMessage && <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center space-x-2">
                    {submitState === 'processing' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
                    {workflowCompleted && <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>}
                   <p className="text-sm font-medium text-primary">
                      {workflowMessage}
                      {workflowMessage.includes('LINK:') && <a href="https://docs.google.com/spreadsheets/d/1nK6qns3GmM8ESHq-57FIbbCi8B59btU0j_iT0cGRFjs/edit?pli=1&gid=616634562#gid=616634562" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                       "Click Here"
                   </a>}
                </p>
                  </div>
                </div>}
            </div>
          </div>
        </main>

        {/* Status Region for Screen Readers */}
        <div className="sr-only" role="status" aria-live="polite">
          {submitState === 'processing' && 'Form is being processed...'}
          {submitState === 'finished' && 'Form submitted successfully. You can now generate a dashboard.'}
          {submitState === 'error' && 'Form submission failed. Please check your inputs and try again.'}
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}
    </div>;
};