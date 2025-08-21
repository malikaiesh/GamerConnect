import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Image, Check, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ProcessedImage {
  url: string;
  altText: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  dimensions: {
    width: number;
    height: number;
  };
}

interface ImageUploaderProps {
  onUploadComplete?: (images: ProcessedImage[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUploader({
  onUploadComplete,
  multiple = false,
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ''
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<ProcessedImage[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate file types
    const invalidFiles = fileArray.filter(file => !acceptedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Validate file count
    if (multiple && fileArray.length > maxFiles) {
      setError(`Too many files. Maximum ${maxFiles} files allowed.`);
      return;
    }

    uploadFiles(fileArray);
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      if (multiple) {
        files.forEach(file => {
          formData.append('images', file);
        });
      } else {
        formData.append('image', files[0]);
      }

      const endpoint = multiple ? '/api/images/upload-multiple' : '/api/images/upload';
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);
      
      const processedImages = multiple ? result.data : [result.data];
      setUploadedImages(processedImages);
      
      // Show success toast with compression info
      const totalCompression = processedImages.reduce((sum: number, img: ProcessedImage) => 
        sum + img.compressionRatio, 0) / processedImages.length;
      
      toast({
        title: "Images processed successfully!",
        description: `${processedImages.length} image(s) compressed by ${Math.round(totalCompression)}% on average and converted to WebP format with AI-generated alt text.`,
      });

      onUploadComplete?.(processedImages);

    } catch (error) {
      console.error('Upload error:', error);
      setError((error as Error).message);
      toast({
        title: "Upload failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    if (files.length === 0) return;
    
    const imageFiles = files.filter(file => acceptedTypes.includes(file.type));
    if (imageFiles.length === 0) {
      setError('No valid image files found');
      return;
    }

    uploadFiles(imageFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onUploadComplete?.(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Smart Image Upload
          </CardTitle>
          <CardDescription>
            Upload images to automatically compress, convert to WebP, and generate SEO-optimized alt text using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={multiple}
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Processing images...
                </p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              </div>
            ) : (
              <>
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {multiple ? 'Drop images here or click to upload' : 'Drop image here or click to upload'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports JPEG, PNG, GIF, WebP • Max 10MB per file
                  {multiple && ` • Up to ${maxFiles} files`}
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Select {multiple ? 'Images' : 'Image'}
                </Button>
              </>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Processed Images ({uploadedImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <img
                    src={image.url}
                    alt={image.altText}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {image.dimensions.width} × {image.dimensions.height}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {image.altText}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">
                        {image.compressionRatio}% smaller
                      </Badge>
                      <Badge variant="outline">
                        {formatFileSize(image.originalSize)} → {formatFileSize(image.compressedSize)}
                      </Badge>
                      <Badge variant="outline">WebP</Badge>
                      <Badge variant="outline">AI Alt Text</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ImageUploader;