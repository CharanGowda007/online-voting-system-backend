/// <reference types="multer" />

export interface BufferedFile  extends Express.Multer.File{
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
