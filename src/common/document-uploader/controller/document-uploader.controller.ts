import {
    Controller,
    DefaultValuePipe,
    Get,
    HttpException,
    HttpStatus,
    Logger,
    Param,
    Post,
    Query,
    Res,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentUploaderService } from '../services/document-uploader.service';
import {
    DocumentMetaInfo,
    EntityType,
    ReferenceType,
} from '../models/documentmetainfo.model';
import { BufferedFile } from 'src/common/s3-client/file.model';
import { Readable } from 'stream';

@Controller('document-uploader')
export class DocumentUploaderController {
    constructor(
        private readonly documentUploaderService: DocumentUploaderService,
        private readonly logger: Logger,
    ) { }

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]),
    )
    async uploadImage(@UploadedFiles() files: { files?: BufferedFile[] }) {
        this.logger.log(
            'Request to upload document',
            DocumentUploaderController.name,
        );
        const doc = new DocumentMetaInfo();
        doc.refId = 1;
        doc.refType = ReferenceType.PRODUCT_IMG;
        doc.entityId = 1;
        doc.entityType = EntityType.PRODUCT;

        if (files && files.files && files.files.length > 0) {
            return await this.documentUploaderService.uploadImage(files.files[0], doc);
        }
        throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }

    @Get('/download')
    async downloadFile(
        @Query('key', new DefaultValuePipe(null)) key: string,
        @Res() res: Response,
    ) {
        try {
            const metaData = await this.documentUploaderService.getMetaData(key);
            // Get the file from MinIO as a stream
            const dataStream = await this.documentUploaderService.downloadFile(key);
            // Set headers for file download
            res.set({
                'Content-Type': metaData.mimetype, // Change based on file type
                'Content-Disposition': `attachment; filename="${metaData.filename}"`,
            });
            // Handle MinIO stream directly without web stream conversion
            if (dataStream.Body instanceof Readable) {
                dataStream.Body.pipe(res);
            } else {
                // Fallback for other stream types
                const buffer = await dataStream.Body.transformToByteArray();
                res.send(Buffer.from(buffer));
            }
        } catch (err) {
            console.error('Error retrieving file:', err);
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }
    }

    @Get('/get-all-files')
    async getAllfiles(
        @Query('entityType', new DefaultValuePipe(null)) entityType: EntityType,
        @Query('entityId', new DefaultValuePipe(null)) entityId: number,
        @Query('refType', new DefaultValuePipe(null)) refType: ReferenceType,
        @Query('refId', new DefaultValuePipe(null)) refId: number,
    ) {
        return await this.documentUploaderService.getAllDocs(
            entityType,
            entityId,
            refType,
            refId,
        );
    }

    @Get(':id')
    async deleteImage(@Param('id') image: string) {
        return await this.documentUploaderService.deleteMinioDoc(image);
    }
}
