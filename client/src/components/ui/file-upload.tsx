import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onFileUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  initialValue?: string;
  className?: string;
  buttonText?: string;
}

export function FileUpload({
  onFileSelect,
  onFileUpload,
  accept = "*/*",
  maxSize = 100, // Default 100MB
  label = "Upload file",
  initialValue,
  className = "",
  buttonText = "Choose file"
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialValue || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const isImage = accept.includes("image");
  const maxSizeBytes = maxSize * 1024 * 1024; // Convert to bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);
    
    const file = e.target.files?.[0] || null;
    
    if (!file) {
      setSelectedFile(null);
      setPreview(initialValue);
      onFileSelect(null);
      return;
    }
    
    // Check file size
    if (file.size > maxSizeBytes) {
      setUploadError(`File is too large. Maximum size is ${maxSize}MB.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
    
    // Create preview for images
    if (isImage && file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, just display the file name
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !onFileUpload) return;
    
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    
    // Simulate progress (in a real implementation this would come from the upload process)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10;
        return newProgress < 90 ? newProgress : prev;
      });
    }, 300);
    
    try {
      const uploadedUrl = await onFileUpload(selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      setPreview(isImage ? uploadedUrl : null);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(initialValue);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    onFileSelect(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label htmlFor="file-upload">{label}</Label>}
      
      <div className="flex flex-col gap-3">
        {/* Preview area */}
        {isImage && preview && (
          <div className="relative w-full h-40 border rounded-md overflow-hidden">
            <img 
              src={preview} 
              className="w-full h-full object-contain" 
              alt="File preview" 
            />
            <button 
              onClick={clearFile}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* File selection area */}
        <div className="flex items-center gap-2">
          <Input
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => document.getElementById("file-upload")?.click()}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
          
          {selectedFile && onFileUpload && !uploadSuccess && (
            <Button 
              type="button" 
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1"
            >
              Upload
            </Button>
          )}
          
          {selectedFile && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Selected file info */}
        {selectedFile && (
          <div className="text-sm text-muted-foreground">
            {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="space-y-1">
            <Progress value={uploadProgress} />
            <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
          </div>
        )}

        {/* Success message */}
        {uploadSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>File uploaded successfully</span>
          </div>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
}