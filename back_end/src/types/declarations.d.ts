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

  interface MulterRequest extends Request {
    file?: MulterFile;
    files?: MulterFile[];
  }

  type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

  interface DiskStorageOptions {
    destination?: string | ((req: Request, file: MulterFile, callback: (error: Error | null, destination: string) => void) => void);
    filename?: (req: Request, file: MulterFile, callback: (error: Error | null, filename: string) => void) => void;
  }

  interface MulterOptions {
    storage?: any;
    fileFilter?: (req: Request, file: MulterFile, callback: FileFilterCallback) => void;
    limits?: {
      fileSize?: number;
      files?: number;
    };
  }

  interface MulterInstance {
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: { name: string; maxCount?: number }[]): any;
    none(): any;
    any(): any;
  }

  function multer(options?: MulterOptions): MulterInstance;
  namespace multer {
    function diskStorage(options: DiskStorageOptions): any;
  }

  export = multer;
}
declare module 'winston';
