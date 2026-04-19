import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostHierarchy } from '../models/postHierarchy.entity';

@Injectable()
export class PostHierarchyService {
  private readonly logger = new Logger(PostHierarchyService.name);

  constructor(
    @InjectRepository(PostHierarchy)
    private postHierarchyRepo: Repository<PostHierarchy>,
  ) {}
}