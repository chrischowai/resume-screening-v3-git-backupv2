import { IntakeFormData } from '../types';
import { readFileAsBase64 } from './file';

const API_ENDPOINT = 'https://n8nchrischowai.zeabur.app/webhook/4e8c3355-be02-462c-904b-a98ba201c18a';

export const buildPayload = async (formData: IntakeFormData) => {
  // Process resume files to base64
  const resumeFilesData = await Promise.all(
    formData.resumeFiles.map(async (file) => {
      const content = await readFileAsBase64(file);
      return {
        fileName: file.name,
        mimeType: file.type,
        contentFormat: file.type === 'application/pdf' ? 'base64_pdf' as const : 'base64_docx' as const,
        content
      };
    })
  );

  return {
    jobTitle: formData.jobTitle,
    numberOfProfiles: formData.numberOfProfiles,
    batch: formData.batch,
    scoringScheme: formData.scoringScheme.map(row => ({
      area: row.areaName,
      weightPercent: row.weightPercent
    })),
    jdDocument: {
      fileName: formData.jdDocument.fileName,
      mimeType: formData.jdDocument.mimeType,
      contentFormat: formData.jdDocument.contentFormat,
      content: formData.jdDocument.content
    },
    resumeFiles: resumeFilesData,
    timestamp: new Date().toISOString()
  };
};

export const submitIntakeForm = async (formData: IntakeFormData) => {
  const payload = await buildPayload(formData);
  
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Placeholder function for dashboard data fetching
export const fetchDashboardData = async () => {
  // This would connect to Supabase in the future
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: 'Dashboard data placeholder',
        candidates: [],
        analytics: {}
      });
    }, 1000);
  });
};
