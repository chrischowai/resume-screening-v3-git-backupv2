
export interface ScoringSchemeRow {
  id: string;
  areaName: string;
  weightPercent: number;
}

export interface FileUpload {
  file: File | null;
  fileName: string | null;
  mimeType: string | null;
  contentFormat: 'markdown_text' | 'base64_pdf' | 'base64_docx' | 'none';
  content: string | null;
}

export interface IntakeFormData {
  jobTitle: string;
  numberOfProfiles: number;
  batch: number;
  scoringScheme: ScoringSchemeRow[];
  jdDocument: FileUpload;
  resumeFiles: File[];
}

export type SubmitState = 'idle' | 'submitting' | 'processing' | 'finished' | 'error';

export interface ApiPayload {
  jobTitle: string;
  numberOfProfiles: number;
  batch: number;
  scoringScheme: Array<{
    area: string;
    weightPercent: number;
  }>;
  jdDocument: {
    fileName: string | null;
    mimeType: string | null;
    contentFormat: 'markdown_text' | 'base64_pdf' | 'base64_docx' | 'none';
    content: string | null;
  };
  resumeFiles: Array<{
    fileName: string;
    mimeType: string;
    contentFormat: 'base64_pdf' | 'base64_docx';
    content: string;
  }>;
  timestamp: string;
}
