import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostPermissionDto } from '../dto/postPermission.dto';
import { PostPermission } from '../models/postPermission.entity';

@Injectable()
export class PostPermissionService {
  private readonly logger = new Logger(PostPermissionService.name);

  constructor(
    @InjectRepository(PostPermission)
    private userPostPermissionRepository: Repository<PostPermission>,
  ) {}

  async create(dto: CreatePostPermissionDto): Promise<PostPermission> {
    const record = this.userPostPermissionRepository.create({
      postId: dto.postId,
      roleId: dto.roleId,
      permissionId: dto.permissionId,
    });
    return this.userPostPermissionRepository.save(record);
  }

  async findAll(): Promise<PostPermission[]> {
    return this.userPostPermissionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: number): Promise<PostPermission> {
    const record = await this.userPostPermissionRepository.findOne({
      where: { id },
    });
    if (!record) {
      throw new HttpException(
        `Post permission not found for id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return record;
  }

  async fetchPermissionsByPostId(postId: string): Promise<PostPermission[]> {
    return this.userPostPermissionRepository.find({
      where: { postId },
    });
  }
}