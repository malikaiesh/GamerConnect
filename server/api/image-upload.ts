import { Router, Request, Response } from 'express';
import { upload, processUploadedImages, handleImageUploadErrors } from '../middleware/image-upload';
import { imageProcessingService } from '../services/image-processing';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

/**
 * Upload and process single image
 */
router.post('/upload', 
  isAuthenticated,
  upload.single('image'),
  processUploadedImages,
  handleImageUploadErrors,
  async (req: Request, res: Response) => {
    try {
      if (!req.processedImages || req.processedImages.length === 0) {
        return res.status(400).json({
          error: 'No image was processed',
          message: 'Please upload a valid image file'
        });
      }

      const processedImage = req.processedImages[0];
      
      res.json({
        success: true,
        message: 'Image uploaded and processed successfully',
        data: {
          url: imageProcessingService.getImageUrl(processedImage.webpPath),
          altText: processedImage.altText,
          originalSize: processedImage.originalSize,
          compressedSize: processedImage.compressedSize,
          compressionRatio: processedImage.compressionRatio,
          dimensions: {
            width: processedImage.width,
            height: processedImage.height
          }
        }
      });
    } catch (error) {
      console.error('Error in image upload:', error);
      res.status(500).json({
        error: 'Failed to upload image',
        message: (error as Error).message
      });
    }
  }
);

/**
 * Upload and process multiple images
 */
router.post('/upload-multiple',
  isAuthenticated,
  upload.array('images', 10), // Max 10 images
  processUploadedImages,
  handleImageUploadErrors,
  async (req: Request, res: Response) => {
    try {
      if (!req.processedImages || req.processedImages.length === 0) {
        return res.status(400).json({
          error: 'No images were processed',
          message: 'Please upload valid image files'
        });
      }

      const processedImages = req.processedImages.map((img: any) => ({
        url: imageProcessingService.getImageUrl(img.webpPath),
        altText: img.altText,
        originalSize: img.originalSize,
        compressedSize: img.compressedSize,
        compressionRatio: img.compressionRatio,
        dimensions: {
          width: img.width,
          height: img.height
        }
      }));

      res.json({
        success: true,
        message: `${processedImages.length} images uploaded and processed successfully`,
        data: processedImages
      });
    } catch (error) {
      console.error('Error in multiple image upload:', error);
      res.status(500).json({
        error: 'Failed to upload images',
        message: (error as Error).message
      });
    }
  }
);

/**
 * Generate alt text for existing image
 */
router.post('/generate-alt-text',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { imagePath } = req.body;
      
      if (!imagePath) {
        return res.status(400).json({
          error: 'Image path is required'
        });
      }

      const altText = await imageProcessingService.generateAltText(imagePath);
      
      res.json({
        success: true,
        altText
      });
    } catch (error) {
      console.error('Error generating alt text:', error);
      res.status(500).json({
        error: 'Failed to generate alt text',
        message: (error as Error).message
      });
    }
  }
);

export default router;