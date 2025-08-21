import React, { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
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

export default function ImageUploadDemo() {
  const [uploadedImages, setUploadedImages] = useState<ProcessedImage[]>([]);
  const { toast } = useToast();

  const handleUploadComplete = (images: ProcessedImage[]) => {
    setUploadedImages(images);
  };

  const copyAltText = (altText: string) => {
    navigator.clipboard.writeText(altText);
    toast({
      title: "Alt text copied",
      description: "The SEO-optimized alt text has been copied to your clipboard.",
    });
  };

  const copyImageUrl = (url: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Image URL copied",
      description: "The optimized image URL has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Smart Image Processing Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Upload images to see automatic compression, WebP conversion, and AI-generated SEO alt text in action
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload Section */}
        <div>
          <ImageUploader
            multiple={true}
            maxFiles={5}
            onUploadComplete={handleUploadComplete}
            className="h-fit"
          />

          {/* Features Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>✨ What happens when you upload?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="outline">🗜️ Compression</Badge>
                <span className="text-sm">Automatically reduces file size by up to 80%</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">🖼️ WebP</Badge>
                <span className="text-sm">Converts to modern WebP format for faster loading</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">🤖 AI Alt Text</Badge>
                <span className="text-sm">Generates SEO-optimized descriptions using GPT-4 Vision</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">📱 Responsive</Badge>
                <span className="text-sm">Automatically resizes for optimal display</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          {uploadedImages.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>🎉 Processing Results</CardTitle>
                <CardDescription>
                  Your images have been optimized and are ready to use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    {/* Image Preview */}
                    <div className="flex gap-4 mb-4">
                      <img
                        src={image.url}
                        alt={image.altText}
                        className="w-24 h-24 object-cover rounded-md border"
                      />
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Dimensions:</span>
                            <br />
                            {image.dimensions.width} × {image.dimensions.height}
                          </div>
                          <div>
                            <span className="font-medium">Compression:</span>
                            <br />
                            <Badge variant="secondary">
                              {image.compressionRatio}% smaller
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alt Text */}
                    <div className="mb-4">
                      <label className="text-sm font-medium">AI-Generated Alt Text:</label>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded border text-sm">
                        {image.altText}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyAltText(image.altText)}
                        className="mt-2"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Alt Text
                      </Button>
                    </div>

                    {/* Image URL */}
                    <div className="mb-4">
                      <label className="text-sm font-medium">Optimized Image URL:</label>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded border text-sm font-mono">
                        {window.location.origin + image.url}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyImageUrl(image.url)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Image
                        </Button>
                      </div>
                    </div>

                    {/* File Size Info */}
                    <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>Original: {(image.originalSize / 1024).toFixed(1)} KB</span>
                      <span>Optimized: {(image.compressedSize / 1024).toFixed(1)} KB</span>
                      <span>Format: WebP</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 dark:text-gray-600">
                  <div className="text-4xl mb-4">📸</div>
                  <p className="text-lg font-medium">Upload images to see the magic happen!</p>
                  <p className="text-sm mt-2">
                    Your processed images will appear here with compression stats and AI-generated alt text
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}