import { FileUpload } from '../types';

export const isValidFileType = (file: File): boolean => {
  const validTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const validExtensions = ['.txt', '.pdf', '.doc', '.docx'];
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  return hasValidType || hasValidExtension;
};

// Alias for backward compatibility
export const validateFileType = isValidFileType;

export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const escapeMarkdown = (text: string): string => {
  // Basic markdown escaping - can be expanded as needed
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
};

export const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Remove data URL prefix (data:application/pdf;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const parsePdfToBase64 = readFileAsBase64;

export const processFileUpload = async (file: File): Promise<FileUpload> => {
  if (!isValidFileType(file)) {
    throw new Error('Only TXT or PDF files are allowed');
  }

  const fileUpload: FileUpload = {
    file,
    fileName: file.name,
    mimeType: file.type,
    contentFormat: 'none',
    content: null
  };

  try {
    if (file.type === 'text/plain') {
      const content = await readTextFile(file);
      fileUpload.contentFormat = 'markdown_text';
      fileUpload.content = content;
    } else if (file.type === 'application/pdf') {
      const content = await readFileAsBase64(file);
      fileUpload.contentFormat = 'base64_pdf';
      fileUpload.content = content;
    }
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }

  return fileUpload;
};
