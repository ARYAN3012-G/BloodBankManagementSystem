import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadsDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'medical-report-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
  }
};

// Configure multer
export const fileUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
});

// Upload handler
export async function uploadFile(req: Request & { file?: Express.Multer.File }, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify file was saved
    const filePath = path.join(uploadsDir, req.file.filename);
    if (!fs.existsSync(filePath)) {
      console.error('File not found after upload:', filePath);
      return res.status(500).json({ error: 'File upload failed - file not saved' });
    }

    // Return the file URL
    const fileUrl = `/uploads/${req.file.filename}`;
    
    console.log('File uploaded successfully:', {
      filename: req.file.filename,
      path: filePath,
      url: fileUrl
    });
    
    return res.status(200).json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}

// Check if file exists
export async function checkFile(req: Request, res: Response) {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return res.status(200).json({
        exists: true,
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      });
    }
    
    return res.status(404).json({
      exists: false,
      filename,
      message: 'File not found'
    });
  } catch (error) {
    console.error('Check file error:', error);
    return res.status(500).json({ error: 'Failed to check file' });
  }
}

// List all uploaded files (for debugging)
export async function listFiles(_req: Request, res: Response) {
  try {
    const files = fs.readdirSync(uploadsDir);
    const fileDetails = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        url: `/uploads/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });
    
    return res.status(200).json({
      count: files.length,
      files: fileDetails
    });
  } catch (error) {
    console.error('List files error:', error);
    return res.status(500).json({ error: 'Failed to list files' });
  }
}
