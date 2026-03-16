import { Injectable } from '@nestjs/common';
import { BufferedFile } from './file.model';

@Injectable()
export class S3ClientService {
    async upload(file: BufferedFile, details: any) {
        return { url: 'dummy', key: 'dummy', fileName: file?.originalname || 'dummy' };
    }
    async downloadFile(key: string): Promise<any> { return { Body: { pipe: (res: any) => {}, transformToByteArray: async () => [] } }; }
    async getMetaData(key: string): Promise<any> { return { mimetype: 'application/octet-stream', filename: 'dummy.txt', entityType: 0, entityId: '1', referenceType: 0, referenceId: '1', id: '1' }; }
    async delete(key: string): Promise<any> { return true; }
}