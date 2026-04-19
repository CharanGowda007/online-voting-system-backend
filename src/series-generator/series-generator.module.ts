import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SeriesGenerator} from './model/series-generator.entity';
import {SeriesGeneratorService} from './service/series-generator.service';

@Module({
    imports:[TypeOrmModule.forFeature([SeriesGenerator])],
    providers:[SeriesGeneratorService],
    exports:[SeriesGeneratorService]
})
export class SeriesGeneratorModule {}