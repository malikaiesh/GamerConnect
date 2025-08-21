import sharp from 'sharp';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ProcessedImage {
  originalPath: string;
  webpPath: string;
  altText: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

export interface ImageProcessingOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  generateAltText?: boolean;
}

export class ImageProcessingService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory() {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Process an uploaded image: compress, convert to WebP, and generate SEO alt text
   */
  async processImage(
    imagePath: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    const {
      quality = 85,
      maxWidth = 1920,
      maxHeight = 1080,
      generateAltText = true,
    } = options;

    try {
      // Get original file stats
      const originalStats = await fs.stat(imagePath);
      const originalSize = originalStats.size;

      // Read and process the image with Sharp
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      // Create unique filename for WebP version
      const fileName = path.basename(imagePath, path.extname(imagePath));
      const webpFileName = `${fileName}_${randomUUID()}.webp`;
      const webpPath = path.join(this.uploadsDir, webpFileName);

      // Process image: resize if needed and convert to WebP
      let processedImage = image;

      // Resize if image exceeds maximum dimensions
      if (metadata.width && metadata.height) {
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
          processedImage = processedImage.resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }
      }

      // Convert to WebP with quality optimization
      await processedImage
        .webp({ quality, effort: 6 })
        .toFile(webpPath);

      // Get compressed file stats
      const compressedStats = await fs.stat(webpPath);
      const compressedSize = compressedStats.size;
      const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

      // Get final image metadata
      const finalMetadata = await sharp(webpPath).metadata();

      let altText = '';
      if (generateAltText && process.env.OPENAI_API_KEY) {
        try {
          altText = await this.generateAltText(webpPath);
        } catch (error) {
          console.error('Error generating alt text:', error);
          altText = 'Image'; // Fallback alt text
        }
      }

      return {
        originalPath: imagePath,
        webpPath,
        altText,
        originalSize,
        compressedSize,
        compressionRatio,
        width: finalMetadata.width || 0,
        height: finalMetadata.height || 0,
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image: ${(error as Error).message}`);
    }
  }

  /**
   * Generate SEO-optimized alt text using OpenAI vision model
   */
  async generateAltText(imagePath: string): Promise<string> {
    try {
      // Read image file and convert to base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and generate a concise, SEO-optimized alt text. The alt text should:
- Be descriptive but under 125 characters
- Include relevant keywords naturally
- Describe key visual elements
- Be suitable for accessibility
- Focus on the main subject/content
- Use clear, simple language

Respond with only the alt text, no additional formatting or explanation.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/webp;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 100,
      });

      const altText = response.choices[0].message.content?.trim() || 'Image';
      
      // Ensure alt text is within reasonable length
      return altText.length > 125 ? altText.substring(0, 122) + '...' : altText;
    } catch (error) {
      console.error('Error generating alt text with OpenAI:', error);
      throw error as Error;
    }
  }

  /**
   * Process multiple images in batch
   */
  async processMultipleImages(
    imagePaths: string[],
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];
    
    for (const imagePath of imagePaths) {
      try {
        const processed = await this.processImage(imagePath, options);
        results.push(processed);
      } catch (error) {
        console.error(`Failed to process image ${imagePath}:`, error);
        // Continue processing other images even if one fails
      }
    }
    
    return results;
  }

  /**
   * Clean up original files after successful processing
   */
  async cleanupOriginalFile(originalPath: string): Promise<void> {
    try {
      await fs.unlink(originalPath);
    } catch (error) {
      console.error('Error cleaning up original file:', error);
    }
  }

  /**
   * Get optimized image URL for serving
   */
  getImageUrl(webpPath: string): string {
    const fileName = path.basename(webpPath);
    return `/uploads/${fileName}`;
  }
}

export const imageProcessingService = new ImageProcessingService();