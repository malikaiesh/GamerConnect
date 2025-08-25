import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*'],
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        onComplete?.(result);
        setShowModal(false);
      })
  );

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} data-testid="button-upload-image">
        {children}
      </Button>

      <style jsx global>{`
        .uppy-Dashboard {
          border-radius: 12px !important;
          border: 2px dashed #6366f1 !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }
        
        .uppy-Dashboard-inner {
          border-radius: 10px !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px) !important;
        }
        
        .uppy-Dashboard-dropFilesHereHint {
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          margin-bottom: 8px !important;
        }
        
        .uppy-Dashboard-browse {
          color: #6366f1 !important;
          font-weight: 600 !important;
          text-decoration: none !important;
          border-bottom: 2px solid #6366f1 !important;
          transition: all 0.2s ease !important;
        }
        
        .uppy-Dashboard-browse:hover {
          color: #4f46e5 !important;
          border-bottom-color: #4f46e5 !important;
        }
        
        .uppy-Dashboard-AddFiles {
          border-radius: 8px !important;
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(5px) !important;
          border: 2px dashed #d1d5db !important;
          transition: all 0.3s ease !important;
        }
        
        .uppy-Dashboard-AddFiles:hover {
          border-color: #6366f1 !important;
          background: rgba(255, 255, 255, 0.9) !important;
        }
        
        .uppy-Dashboard-AddFiles-info {
          padding: 20px !important;
        }
        
        .uppy-Dashboard-note {
          font-size: 14px !important;
          color: #6b7280 !important;
          font-weight: 500 !important;
        }
        
        .uppy-Dashboard-AddFiles-title {
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #374151 !important;
          margin-bottom: 10px !important;
        }
        
        .uppy-DashboardItem {
          border-radius: 8px !important;
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid #e5e7eb !important;
        }
        
        .uppy-Dashboard-progressindicators {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 0 0 10px 10px !important;
        }
        
        .uppy-ProgressBar {
          background: linear-gradient(90deg, #6366f1, #8b5cf6) !important;
          border-radius: 4px !important;
        }
        
        .uppy-Dashboard-close {
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 50% !important;
          border: 1px solid #e5e7eb !important;
          width: 32px !important;
          height: 32px !important;
          transition: all 0.2s ease !important;
        }
        
        .uppy-Dashboard-close:hover {
          background: #f3f4f6 !important;
          border-color: #d1d5db !important;
        }
      `}</style>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        theme="light"
        height={450}
        width={600}
        note="Upload your profile picture (max 5MB)"
        closeAfterFinish={true}
        showProgressDetails={true}
        doneButtonHandler={() => setShowModal(false)}
      />
    </div>
  );
}