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
import { Shield, FileText, Users, Settings, LogOut, Briefcase, Target, Award, Clock, CheckCircle2, AlertCircle, BarChart3, Sparkles } from 'lucide-react';
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
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Premium Professional Header */}
        <header className="mb-8 animate-fadeIn">
          <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary via-primary-hover to-primary"></div>
            
            <div className="px-8 py-7">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center space-x-5">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-primary/30">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent tracking-tight">
                        Resume Screening Tool
                      </h1>
                      <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Enterprise Talent Acquisition Platform • AI-Powered Candidate Matching</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Session Active</span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={logout} 
                    className="h-11 px-6 font-semibold border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Indicator */}
        <div className="mb-8 animate-fadeIn animate-delay-100">
          <div className="bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg shadow-primary/5 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center">
                <Target className="w-4 h-4 mr-2 text-primary" />
                Workflow Progress
              </h3>
              <span className="text-xs text-muted-foreground font-medium">Complete all steps to proceed</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                jobTitle ? 'bg-success/10 border border-success/30' : 'bg-slate-50 border border-border/30'
              }`}>
                {jobTitle ? <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0"></div>}
                <div>
                  <p className="text-xs font-semibold text-foreground">Job Details</p>
                  <p className="text-xs text-muted-foreground">Position info</p>
                </div>
              </div>
              <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                scoringTable.totalStatus === 'valid' ? 'bg-success/10 border border-success/30' : 'bg-slate-50 border border-border/30'
              }`}>
                {scoringTable.totalStatus === 'valid' ? <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0"></div>}
                <div>
                  <p className="text-xs font-semibold text-foreground">Scoring Setup</p>
                  <p className="text-xs text-muted-foreground">{scoringTable.total}% configured</p>
                </div>
              </div>
              <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                fileUpload.file ? 'bg-success/10 border border-success/30' : 'bg-slate-50 border border-border/30'
              }`}>
                {fileUpload.file ? <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0"></div>}
                <div>
                  <p className="text-xs font-semibold text-foreground">Job Description</p>
                  <p className="text-xs text-muted-foreground">{fileUpload.file ? 'Uploaded' : 'Pending'}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                resumeFiles.length > 0 ? 'bg-success/10 border border-success/30' : 'bg-slate-50 border border-border/30'
              }`}>
                {resumeFiles.length > 0 ? <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0"></div>}
                <div>
                  <p className="text-xs font-semibold text-foreground">Resumes</p>
                  <p className="text-xs text-muted-foreground">{resumeFiles.length > 0 ? `${resumeFiles.length} files` : 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form - Premium Card Layout */}
        <main className="space-y-6">
          {/* Job Information Section */}
          <div className="group bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-primary/5 border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30 animate-fadeIn animate-delay-200">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-6 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center">
                      Job Information
                      {jobTitle && <CheckCircle2 className="w-5 h-5 ml-2 text-success" />}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Define the position requirements and specifications</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-primary/5 rounded-lg">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Step 1</span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-gradient-to-b from-white/50 to-transparent">
              <JobInfoForm jobTitle={jobTitle} onJobTitleChange={setJobTitle} />
            </div>
          </div>

          {/* Scoring Scheme Section */}
          <div className="group bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-primary/5 border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30 animate-fadeIn animate-delay-300">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-6 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center">
                      Scoring Scheme
                      {scoringTable.totalStatus === 'valid' && <CheckCircle2 className="w-5 h-5 ml-2 text-success" />}
                      {scoringTable.totalStatus === 'invalid' && <AlertCircle className="w-5 h-5 ml-2 text-warning" />}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Configure evaluation criteria and weightings • Total: {scoringTable.total}%</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-primary/5 rounded-lg">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Step 2</span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-gradient-to-b from-white/50 to-transparent">
              <ScoringTable rows={scoringTable.rows} total={scoringTable.total} totalStatus={scoringTable.totalStatus} onAddRow={scoringTable.addRow} onDeleteRow={scoringTable.deleteRow} onUpdateRow={scoringTable.updateRow} />
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="group bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-primary/5 border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30 animate-fadeIn animate-delay-300">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-6 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center">
                      Document Upload
                      {(fileUpload.file && resumeFiles.length > 0) && <CheckCircle2 className="w-5 h-5 ml-2 text-success" />}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {fileUpload.file ? '✓ JD uploaded' : 'Upload job description'} • {resumeFiles.length > 0 ? `${resumeFiles.length} resume(s) uploaded` : 'Upload candidate resumes'}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-primary/5 rounded-lg">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Step 3</span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-gradient-to-b from-white/50 to-transparent">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FileUpload fileUpload={fileUpload} onFileSelect={setFileUpload} onFileRemove={() => setFileUpload(INITIAL_FILE_UPLOAD)} />
                <ResumeUpload resumeFiles={resumeFiles} onFilesSelect={setResumeFiles} onFilesRemove={() => setResumeFiles([])} />
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="group bg-gradient-to-br from-white/90 to-primary/5 backdrop-blur-md rounded-2xl shadow-xl shadow-primary/10 border border-primary/20 overflow-hidden animate-fadeIn animate-delay-300">
            <div className="p-8">
              <ActionButtons submitState={submitState} canSubmit={canSubmit} canGenerateReport={canGenerateReport} onSubmit={handleSubmit} onGenerateReport={handleGenerateReport} onReset={handleReset} />
              
              {/* Status Message Bar */}
              {workflowMessage && <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm">
                  <div className="flex items-center space-x-3">
                    {submitState === 'processing' && <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>}
                    {workflowCompleted && <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>}
                   <p className="text-sm font-medium text-foreground leading-relaxed">
                      {workflowMessage}
                      {workflowMessage.includes('LINK:') && <a href="https://docs.google.com/spreadsheets/d/1nK6qns3GmM8ESHq-57FIbbCi8B59btU0j_iT0cGRFjs/edit?pli=1&gid=616634562#gid=616634562" target="_blank" rel="noopener noreferrer" className="ml-1 font-semibold text-primary underline hover:text-primary-hover transition-colors">
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