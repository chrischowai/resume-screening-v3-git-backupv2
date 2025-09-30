import React, { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, X, FileText, File } from 'lucide-react';

interface ResumeUploadProps {
  resumeFiles: File[];
  onFilesSelect: (files: File[]) => void;
  onFilesRemove: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  resumeFiles,
  onFilesSelect,
  onFilesRemove
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    return hasValidType || hasValidExtension;
  };

  const validateFiles = useCallback((files: File[]) => {
    setError(null);
    
    const invalidFiles = files.filter(file => !validateFile(file));
    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Only PDF and MS Word files are allowed.`);
      return false;
    }

    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024); // 5MB
    if (oversizedFiles.length > 0) {
      setError(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 5MB per file.`);
      return false;
    }

    return true;
  }, []);

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
      if (validateFiles(files)) {
        onFilesSelect([...resumeFiles, ...files]);
      }
    }
  }, [resumeFiles, onFilesSelect, validateFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (validateFiles(files)) {
        onFilesSelect([...resumeFiles, ...files]);
      }
    }
  }, [resumeFiles, onFilesSelect, validateFiles]);

  const removeFile = useCallback((index: number) => {
    const newFiles = resumeFiles.filter((_, i) => i !== index);
    onFilesSelect(newFiles);
  }, [resumeFiles, onFilesSelect]);

  const getFileIcon = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.endsWith('.pdf')) return File;
    return FileText;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section className="space-y-4">
      <Label className="text-xl font-semibold text-foreground">Resumes to be screened (PDF or MS Word)</Label>
      
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragActive ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border/50'}
          ${error ? 'border-destructive bg-destructive/5' : ''}
          hover:border-primary/50 hover:bg-primary/5
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-base font-semibold mb-2 text-foreground">Drop resume files here</h3>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse (PDF or MS Word only, max 5MB each)
        </p>
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileInput}
          multiple
          className="hidden"
          id="resume-upload"
          aria-describedby={error ? 'resume-error' : undefined}
        />
        <Button variant="outline" asChild className="border-primary/20 text-primary hover:bg-primary/10">
          <label htmlFor="resume-upload" className="cursor-pointer">
            Browse Files
          </label>
        </Button>
        
        {resumeFiles.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {resumeFiles.length} file(s) selected
          </p>
        )}
      </div>

      {resumeFiles.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {resumeFiles.map((file, index) => {
            const FileIcon = getFileIcon(file.name);
            return (
              <div key={index} className="flex items-center justify-between bg-card border border-border/50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <FileIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          
          {resumeFiles.length > 1 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onFilesRemove}
                className="text-muted-foreground hover:text-destructive transition-colors text-sm"
              >
                Remove All Files
              </Button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div id="resume-error" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-4" role="alert">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </section>
  );
};