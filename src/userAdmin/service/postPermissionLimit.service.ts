import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostPermissionLimit } from '../models/postPermissionLimit.entity';

@Injectable()
export class PostPermissionLimitService {
  private readonly logger = new Logger(PostPermissionLimitService.name);

  constructor(
    @InjectRepository(PostPermissionLimit)
    private postPermissionLimitRepo: Repository<PostPermissionLimit>,
  ) {}
}