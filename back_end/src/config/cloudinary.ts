/**
 * Cloudinary Configuration
 * 
 * This file configures Cloudinary cloud storage for medical report file uploads.
 * Cloudinary provides persistent cloud storage, ensuring files are accessible
 * from all instances (local and deployed) and survive server restarts.
 * 
 * Environment Variables Required:
 * - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 * - CLOUDINARY_API_KEY: Your Cloudinary API key
 * - CLOUDINARY_API_SECRET: Your Cloudinary API secret
 * 
 * Get these credentials from: https://cloudinary.com/console
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Always use HTTPS for secure file transfers
});

export default cloudinary;
