import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostPersonMappingStatus } from '../enums/postPersonMappingStatus';
import { PersonalDetails } from '../models/personalDetails.entity';
import { PostDetails } from '../models/postDetails.entity';
import { PostManagerMapping } from '../models/postManagerMapping.entity';
import { PostPersonMapping } from '../models/postPersonMapping.entity';

@Injectable()
export class PostManagerMappingService {
  private readonly logger = new Logger(PostManagerMappingService.name);

  constructor(
    @InjectRepository(PostManagerMapping)
    private postManagerMappingRepository: Repository<PostManagerMapping>,
    @InjectRepository(PostDetails)
    private postRepository: Repository<PostDetails>,
    @InjectRepository(PostPersonMapping)
    private postPersonMappingRepository: Repository<PostPersonMapping>,
    @InjectRepository(PersonalDetails)
    private personalDetailsRepository: Repository<PersonalDetails>,
  ) {}

  async getManagersAssignedToPostByPostId(
    postId: string,
  ): Promise<(PostManagerMapping & { personalDetails: PersonalDetails })[]> {
    this.logger.log(`Fetching managers for post ID: ${postId}`);
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    const postManagerMappings = await this.postManagerMappingRepository.find({
      where: { postId, status: 'active' },
    });
    const managerDetails: (PostManagerMapping & {
      personalDetails: PersonalDetails;
    })[] = [];
    for (const manager of postManagerMappings) {
      const personMapping = await this.postPersonMappingRepository.findOne({
        where: {
          postId: manager.managerId,
          status: PostPersonMappingStatus.ACTIVE,
        },
      });
      const personalDetails = personMapping
        ? await this.personalDetailsRepository.findOne({
            where: { id: personMapping.personId },
          })
        : null;
      if (personalDetails) {
        managerDetails.push({
          ...manager,
          personalDetails,
        });
      }
    }
    return managerDetails;
  }
}