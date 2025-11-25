import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error?: string;
  maxSizeMB?: number;
}

const DocumentUpload = ({
  onFileSelect,
  selectedFile,
  error,
  maxSizeMB = 50,
}: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Validate file size
  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB} MB limit`;
    }
    return null;
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        onFileSelect(null);
        return;
      }
      onFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        onFileSelect(null);
        return;
      }
      onFileSelect(file);
    }
  };

  // Handle click to open file dialog
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file removal
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="*/*"
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-smooth glass-card',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50',
          error && 'border-destructive',
          selectedFile && 'border-primary bg-primary/5'
        )}
      >
        {!selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop your file here, or{' '}
                <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: {maxSizeMB} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
