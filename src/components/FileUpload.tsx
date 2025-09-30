
import React, { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, X, File, FileText, FileImage } from 'lucide-react';
import { validateFileType, validateFileSize, formatFileSize } from '../utils/file';
import { FileUpload as FileUploadType } from '../types';

interface FileUploadProps {
  fileUpload: FileUploadType;
  onFileSelect: (file: FileUploadType) => void;
  onFileRemove: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  fileUpload,
  onFileSelect,
  onFileRemove
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndProcessFile = useCallback(async (file: File) => {
    setError(null);

    // Validate file type
    if (!validateFileType(file)) {
      setError('Only TXT, PDF, or MS Word files are allowed.');
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      setError('File size must be less than 5MB.');
      return;
    }

    // Process file based on type
    try {
      let content = null;
      let contentFormat: 'markdown_text' | 'base64_pdf' | 'base64_docx' | 'none' = 'none';

      if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        const { readTextFile, escapeMarkdown } = await import('../utils/file');
        const textContent = await readTextFile(file);
        content = escapeMarkdown(textContent);
        contentFormat = 'markdown_text';
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const { parsePdfToBase64 } = await import('../utils/file');
        content = await parsePdfToBase64(file);
        contentFormat = 'base64_pdf';
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword' ||
        file.name.toLowerCase().endsWith('.docx') ||
        file.name.toLowerCase().endsWith('.doc')
      ) {
        const { readFileAsBase64 } = await import('../utils/file');
        content = await readFileAsBase64(file);
        contentFormat = 'base64_docx';
      }

      const processedFile: FileUploadType = {
        file,
        fileName: file.name,
        mimeType: file.type,
        contentFormat,
        content
      };

      onFileSelect(processedFile);
    } catch (error) {
      setError('Failed to process file. Please try again.');
      console.error('File processing error:', error);
    }
  }, [onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      
      if (files.length > 1) {
        setError('Only one file is accepted.');
        return;
      }
      
      validateAndProcessFile(files[0]);
    }
  }, [validateAndProcessFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  }, [validateAndProcessFile]);

  const getFileIcon = () => {
    if (!fileUpload.file) return FileText;
    
    const fileName = fileUpload.file.name.toLowerCase();
    if (fileName.endsWith('.pdf')) return File;
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return FileImage;
    return FileText;
  };

  const FileIcon = getFileIcon();

  return (
    <section className="space-y-4">
      <Label className="text-xl font-semibold text-foreground">JD & Requirements (TXT, PDF, or MS Word)</Label>
      
      {!fileUpload.file ? (
        <div
          className={`
            border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
            ${dragActive ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border/50'}
            ${error ? 'border-destructive bg-destructive/5' : ''}
            hover:border-primary/50 hover:bg-primary/5
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Drop your file here</h3>
          <p className="text-sm text-muted-foreground mb-6">
            or click to browse (TXT, PDF, or MS Word only, max 5MB)
          </p>
          <input
            type="file"
            accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            aria-describedby={error ? 'file-error' : undefined}
          />
          <Button variant="outline" asChild className="border-primary/20 text-primary hover:bg-primary/10">
            <label htmlFor="file-upload" className="cursor-pointer">
              Browse Files
            </label>
          </Button>
        </div>
      ) : (
        <div className="border border-border/50 rounded-xl p-6 bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <FileIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{fileUpload.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(fileUpload.file.size)} • {fileUpload.contentFormat.replace('_', ' ')}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFileRemove}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div id="file-error" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4" role="alert">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </section>
  );
};
