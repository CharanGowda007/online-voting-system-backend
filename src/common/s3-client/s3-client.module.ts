import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {S3ClientService} from './s3-client.service';

@Module({
    providers:[S3ClientService],
    exports:[S3ClientService],
    imports:[ConfigModule]
})
export class S3ClientModule {}