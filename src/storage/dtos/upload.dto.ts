import { AttachmentType } from '@prisma/client';

/**
 * Interface para parâmetros de upload de arquivo
 */
export interface UploadFileParams {
  type: AttachmentType;
  userId?: number;
  file: Express.Multer.File;
}

/**
 * Interface para resposta de upload
 */
export interface UploadResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: AttachmentType;
  storageKey: string;
}
