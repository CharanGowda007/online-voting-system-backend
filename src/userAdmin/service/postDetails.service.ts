import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import * as bcrypt from 'bcrypt';
import { User } from 'src/common/user/entity/user.entity';
import { UserStatus } from 'src/common/user/enums/userStatus.enum';
import { UserType } from 'src/common/user/enums/userTypes.enum';
import { RoleCode } from 'src/common/user/enums/roleCode.enum';
import { Role } from 'src/common/user/entity/role.entity';
import { PostDetails } from '../models/postDetails.entity';
import {
  CreatePostDetailsDto,
  PostDetailsQueryDto,
  UpdatePostDetailsDto,
} from '../dto/postDetails.dto';

/** Default password for auto-created post users (must change on first login). */
const DEFAULT_POST_USER_PASSWORD = 'Okay@123456';

@Injectable()
export class PostDetailsService {
  private readonly logger = new Logger(PostDetailsService.name);

  constructor(
    @InjectRepository(PostDetails)
    private postDetailsRepo: Repository<PostDetails>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  /** Map role code to UserType for the user created with the post. */
  private roleCodeToUserType(roleCode: string): UserType {
    const map: Record<string, UserType> = {
      [RoleCode.ADMIN]: UserType.ADMIN,
      [RoleCode.CANDIDATE]: UserType.CANDIDATE,
      [RoleCode.VOTER]: UserType.VOTER,
    
    };
    return map[roleCode];
  }

  async create(dto: CreatePostDetailsDto): Promise<PostDetails> {
    const post = this.postDetailsRepo.create({
      postName: dto.postName,
      departmentName: dto.departmentName,
      roleId: dto.roleId,
      roleName: dto.roleName,
      locationId: dto.locationId,
      location: dto.location,
      ofcAddress: dto.ofcAddress,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      postId: dto.postId,
      aliasName: dto.aliasName,
    });
    const savedPost = await this.postDetailsRepo.save(post);

    // BDA-style: create a User row with same id as post so post-person mapping can set loginId when person is mapped
    const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
    const userType = role
      ? this.roleCodeToUserType(role.code)
      : UserType.VOTER;

    const hashedPassword = await bcrypt.hash(DEFAULT_POST_USER_PASSWORD, 10);
    const user = this.userRepository.create({
      userType,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      email: savedPost.email ?? undefined,
      aliasName: savedPost.aliasName ?? undefined,
      changePasswordRequired: true,
      resetRequired: true,
      lastPasswordChanged: new Date(),
    });
    (user as User & { id: string }).id = savedPost.id;
    await this.userRepository.save(user);
    this.logger.log(
      `Created user for post ${savedPost.id} (loginId set when person is mapped)`,
    );

    return savedPost;
  }

  async findAll(
    query?: PostDetailsQueryDto,
  ): Promise<Pagination<PostDetails> | PostDetails[]> {
    try {
      if (!query) {
        return this.postDetailsRepo.find({
          order: { createdAt: 'DESC' },
        });
      }

      const { search, page, limit } = query;
      const queryBuilder = this.postDetailsRepo.createQueryBuilder('post');

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(post.postName) LIKE LOWER(:search)', {
              search: `%${search}%`,
            })
              .orWhere('LOWER(post.departmentName) LIKE LOWER(:search)', {
                search: `%${search}%`,
              })
              .orWhere('LOWER(post.roleName) LIKE LOWER(:search)', {
                search: `%${search}%`,
              })
              .orWhere('LOWER(post.location) LIKE LOWER(:search)', {
                search: `%${search}%`,
              })
              .orWhere('LOWER(post.email) LIKE LOWER(:search)', {
                search: `%${search}%`,
              })
              .orWhere('LOWER(post.phoneNumber) LIKE LOWER(:search)', {
                search: `%${search}%`,
              })
              .orWhere('LOWER(post.aliasName) LIKE LOWER(:search)', {
                search: `%${search}%`,
              });
          }),
        );
      }

      queryBuilder.orderBy('post.createdAt', 'DESC');

      const options: IPaginationOptions = {
        page: page ?? 1,
        limit: limit ?? 10,
      };

      return await paginate<PostDetails>(queryBuilder, options);
    } catch (error) {
      this.logger.error(`Error fetching posts: ${(error as Error).message}`);
      throw new HttpException(
        (error as Error).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getById(id: string): Promise<PostDetails> {
    this.logger.log(`Fetching Post Details with ID ${id}`);
    const details = await this.postDetailsRepo.findOne({
      where: { id },
    });
    if (!details) {
      throw new HttpException(
        `Post details not found for id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return details;
  }

  async update(id: string, dto: UpdatePostDetailsDto): Promise<PostDetails> {
    const existing = await this.postDetailsRepo.findOne({ where: { id } });
    if (!existing) {
      throw new HttpException(
        `Post details not found for id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    const updateData: Partial<PostDetails> = {};
    if (dto.postName !== undefined) updateData.postName = dto.postName;
    if (dto.departmentName !== undefined)
      updateData.departmentName = dto.departmentName;
    if (dto.roleId !== undefined) updateData.roleId = dto.roleId;
    if (dto.roleName !== undefined) updateData.roleName = dto.roleName;
    if (dto.locationId !== undefined) updateData.locationId = dto.locationId;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.ofcAddress !== undefined) updateData.ofcAddress = dto.ofcAddress;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phoneNumber !== undefined) updateData.phoneNumber = dto.phoneNumber;
    if (dto.postId !== undefined) updateData.postId = dto.postId;
    if (dto.aliasName !== undefined) updateData.aliasName = dto.aliasName;
    await this.postDetailsRepo.update(id, updateData);
    return this.getById(id);
  }
}