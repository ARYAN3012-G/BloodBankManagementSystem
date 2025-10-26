declare module 'bcryptjs';
declare module 'jsonwebtoken';
declare module 'cors';
declare module 'morgan';
declare module 'cookie-parser';
declare module 'helmet';
declare module 'express-rate-limit';
declare module 'express-validator';
declare module 'multer' {
  import { Request } from 'express';

  namespace Express {
    interface Multer {
      single(fieldname: string): any;
      array(fieldname: string, maxCount?: number): any;
      fields(fields: { name: string; maxCount?: number }[]): any;
      none(): any;
      any(): any;
    }

    interface MulterFile {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
      stream?: any;
    }
  }

  interface MulterRequest extends Request {
    file?: Express.MulterFile;
    files?: Express.MulterFile[];
  }

  type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

  interface DiskStorageOptions {
    destination?: string | ((req: Request, file: Express.MulterFile, callback: (error: Error | null, destination: string) => void) => void);
    filename?: (req: Request, file: Express.MulterFile, callback: (error: Error | null, filename: string) => void) => void;
  }

  const multer: {
    (options?: any): Express.Multer;
    diskStorage: (options: DiskStorageOptions) => any;
  };

  export = multer;
}
declare module 'winston';
