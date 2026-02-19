'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileSelect, isLoading = false }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError('');

    // Validate file type
    if (!file.name.endsWith('.vcf')) {
      setError('Please upload a valid VCF file (.vcf)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      const content = await file.text();
      setSelectedFile(file);
      onFileSelect(file, content);
    } catch (err) {
      setError('Failed to read file. Please try again.');
      console.error('[v0] File read error:', err);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-secondary bg-secondary/5 scale-[1.02]'
            : 'border-border hover:border-secondary/60 hover:bg-secondary/5'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".vcf"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0]);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/20">
            <Upload className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {selectedFile ? selectedFile.name : 'Drag and drop your VCF file'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Max file size: 5MB | Format: .vcf | Files over 5MB will be declined
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-chart-5/5 border border-chart-5/20 rounded-xl flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <X className="w-5 h-5 text-chart-5" />
          </div>
          <div>
            <p className="text-sm text-chart-5 font-medium">{error}</p>
            {error.includes('5MB') && (
              <p className="text-xs text-chart-5/70 mt-1">Please reduce the file size or use a smaller subset of your VCF data.</p>
            )}
            {error.includes('.vcf') && (
              <p className="text-xs text-chart-5/70 mt-1">Only .vcf files are accepted. Ensure the file has a .vcf extension and starts with ##fileformat=VCFv4.x</p>
            )}
          </div>
        </div>
      )}

      {selectedFile && !error && (
        <div className="mt-4 p-4 bg-secondary/5 border border-secondary/20 rounded-xl flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
            <Upload className="w-3 h-3 text-secondary" />
          </div>
          <p className="text-sm text-secondary font-medium">
            {selectedFile.name} ready for analysis
          </p>
          <span className="text-xs text-muted-foreground font-mono ml-auto">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </span>
        </div>
      )}
    </div>
  );
}
