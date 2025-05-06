import { useState, useRef, useEffect } from "react";
import { UploadCloud, X, FileIcon, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onFileUpload?: (file: File) => Promise<any>;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  initialValue?: string | null;
  label?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileUpload,
  accept = "*/*",
  maxSize = 10, // Default 10MB
  multiple = false,
  initialValue,
  label = "Upload a file",
  buttonText = "Select File",
  className,
  disabled = false,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialValue || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset success state after 3 seconds
  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }
    
    // Check file type if accept is provided
    if (accept !== "*/*") {
      const fileType = file.type;
      const acceptTypes = accept.split(",").map(type => type.trim());
      
      // Check for file extensions (e.g., .pdf, .docx)
      if (accept.includes(".")) {
        const fileName = file.name;
        const fileExtension = `.${fileName.split(".").pop()?.toLowerCase()}`;
        const isValidExtension = acceptTypes.some(type => {
          // Handle wildcards like .doc*
          if (type.endsWith("*")) {
            const prefix = type.slice(0, -1);
            return fileExtension.startsWith(prefix);
          }
          return type === fileExtension;
        });
        
        if (!isValidExtension) {
          setError(`File type not accepted. Please upload ${accept} files.`);
          return;
        }
      } 
      // Check MIME types
      else if (fileType && !acceptTypes.some(type => {
        if (type.endsWith("/*")) {
          const prefix = type.slice(0, -2);
          return fileType.startsWith(prefix);
        }
        return type === fileType;
      })) {
        setError(`File type not accepted. Please upload ${accept} files.`);
        return;
      }
    }
    
    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    
    setSelectedFile(file);
    onFileSelect(file);
    
    // Auto upload if onFileUpload is provided
    if (onFileUpload) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!onFileUpload) return;
    
    try {
      setIsUploading(true);
      setError(null);
      await onFileUpload(file);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    onFileSelect(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      <div 
        className={cn(
          "flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          error ? "border-destructive" : "",
          "transition-colors duration-200",
          "cursor-pointer",
          disabled ? "opacity-50 cursor-not-allowed" : ""
        )}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
        onDrop={!disabled ? handleDrop : undefined}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-2 py-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading file...</p>
          </div>
        ) : selectedFile || preview ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {preview ? (
                  <div className="w-12 h-12 rounded overflow-hidden">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <FileIcon className="h-10 w-10 text-primary" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {selectedFile?.name || (preview && "Current file")}
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {isSuccess && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            </div>
            
            {onFileUpload && selectedFile && !isSuccess && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload(selectedFile);
                }}
                disabled={isUploading || disabled}
                className="mt-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 py-4">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to {buttonText.toLowerCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                Max file size: {maxSize}MB
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2"
              disabled={disabled}
            >
              {buttonText}
            </Button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}