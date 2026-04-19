import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeriesGenerator } from '../model/series-generator.entity';

@Injectable()
export class SeriesGeneratorService {
  constructor(
    @InjectRepository(SeriesGenerator)
    private readonly seriesGeneratorRepository: Repository<SeriesGenerator>,
  ) {}

  async generateAndSavePrefix(
    prefix: string,
    paddingLength: number = 6,
  ): Promise<string> {
    const record = await this.seriesGeneratorRepository.findOne({
      where: { prefix },
    });
    let savedRecord;
    if (record) {
      record.value = String(parseInt(record.value, 10) + 1).padStart(
        paddingLength,
        '0',
      );
      savedRecord = await this.seriesGeneratorRepository.save(record);
    } else {
      const newRecord = this.seriesGeneratorRepository.create({
        prefix,
        value: '1'.padStart(paddingLength, '0'),
      });
      savedRecord = await this.seriesGeneratorRepository.save(newRecord);
    }
    return prefix + savedRecord.value;
  }

  async getNextValue(prefix: string): Promise<number> {
    const record = await this.seriesGeneratorRepository.findOne({
      where: { prefix },
    });
    let savedRecord;
    if (record) {
      record.value = String(parseInt(record.value, 10) + 1);
      savedRecord = await this.seriesGeneratorRepository.save(record);
    } else {
      const newRecord = this.seriesGeneratorRepository.create({
        prefix,
        value: '1',
      });
      savedRecord = await this.seriesGeneratorRepository.save(newRecord);
    }
    return parseInt(savedRecord.value, 10);
  }
}
