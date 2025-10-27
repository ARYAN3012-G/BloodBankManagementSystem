/**
 * Cloudinary Upload Utilities
 * 
 * This module provides helper functions for uploading and deleting files from Cloudinary.
 * All medical reports are stored in the cloud, making them accessible from any instance
 * (local development, deployed backend, or frontend on any device).
 */

import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

/**
 * Result object returned after successful Cloudinary upload
 */
export interface CloudinaryUploadResult {
  url: string;        // Full HTTPS URL to access the file
  publicId: string;   // Unique identifier for the file (used for deletion)
  format: string;     // File format (pdf, jpg, png, etc.)
  bytes: number;      // File size in bytes
}

/**
 * Upload a file to Cloudinary
 * @param fileBuffer - File buffer from multer
 * @param folder - Cloudinary folder path
 * @param resourceType - Type of resource (image, raw for PDFs)
 * @returns Upload result with URL and metadata
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = 'medical-reports',
  resourceType: 'image' | 'raw' = 'raw'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        } else {
          reject(new Error('Upload failed - no result returned'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Cloudinary public ID of the file
 * @param resourceType - Type of resource
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' = 'raw'
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}
