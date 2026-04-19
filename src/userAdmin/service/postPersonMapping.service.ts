import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { In, Not, Repository } from 'typeorm';
import {
  CreatePostPersonMappingDto,
  PostPersonMappingDTO,
} from '../dto/postPersonMapping.dto';
import { PostPersonMappingStatus } from '../enums/postPersonMappingStatus';
import { PersonalDetails } from '../models/personalDetails.entity';
import { PostDetails } from '../models/postDetails.entity';
import { PostPersonMapping } from '../models/postPersonMapping.entity';
import { User } from 'src/common/user/entity/user.entity';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

export interface FindAndCountOptions {
  skip: number;
  take: number;
  order?: { [key: string]: 'ASC' | 'DESC' };
}

@Injectable()
export class PostPersonMappingService {
  private readonly logger = new Logger(PostPersonMappingService.name);

  constructor(
    @InjectRepository(PostPersonMapping)
    private postPersonMapping: Repository<PostPersonMapping>,
    @InjectRepository(PostDetails)
    private postDetailsRepo: Repository<PostDetails>,
    @InjectRepository(PersonalDetails)
    private personalDetailsRepo: Repository<PersonalDetails>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreatePostPersonMappingDto): Promise<PostPersonMapping> {
    const postId =
      (dto as Record<string, unknown>).postId ??
      (dto as Record<string, unknown>).post_id;
    const personId =
      (dto as Record<string, unknown>).personId ??
      (dto as Record<string, unknown>).person_id;
    const pid = postId != null ? String(postId).trim() : '';
    const pnid = personId != null ? String(personId).trim() : '';
    if (!pid || !pnid) {
      throw new HttpException(
        'postId and personId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.mapping(pid, pnid, dto);
  }

  async mapping(
    postId: string,
    personId: string,
    dto: CreatePostPersonMappingDto,
  ): Promise<PostPersonMapping> {
    const post = await this.postDetailsRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new HttpException(
        `Post with ID ${postId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const person = await this.personalDetailsRepo.findOne({
      where: { id: personId },
    });
    if (!person) {
      throw new HttpException(
        `Person with ID ${personId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const personUniqueId = person.personUniqueId?.trim();
    if (!personUniqueId) {
      throw new HttpException(
        'Person must have personUniqueId set for mapping (first create personal details with unique id)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const alreadySame = await this.postPersonMapping.findOne({
      where: {
        personId,
        postId,
        status: PostPersonMappingStatus.ACTIVE,
      },
    });
    if (alreadySame) {
      throw new HttpException(
        'This person is already mapped to this post',
        HttpStatus.CONFLICT,
      );
    }
    const existingOther = await this.postPersonMapping.findOne({
      where: {
        personId,
        status: PostPersonMappingStatus.ACTIVE,
        postId: Not(postId),
      },
    });
    if (existingOther) {
      throw new HttpException(
        'This person is already mapped to another post',
        HttpStatus.CONFLICT,
      );
    }
    const now = new Date();
    const formattedDate =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const mapping = this.postPersonMapping.create({
      postId,
      personId,
      startDate: dto.startDate ?? formattedDate,
      endDate: dto.endDate ?? undefined,
      status: PostPersonMappingStatus.ACTIVE,
    });
    const savedMapping = await this.postPersonMapping.save(mapping);

    // BDA-style: update users table – clear this loginId from any other user, then set post’s user to this person
    await this.userRepository.update(
      { loginId: personUniqueId },
      { loginId: null as unknown as string },
    );
    await this.userRepository.update(
      { id: postId },
      { loginId: personUniqueId },
    );
    this.logger.log(
      `User for post ${postId} set to loginId=${personUniqueId} (person ${personId})`,
    );
    return savedMapping;
  }

  async findAndCount(
    options: FindAndCountOptions,
  ): Promise<[PostPersonMapping[], number]> {
    return this.postPersonMapping.findAndCount({
      skip: options.skip,
      take: options.take,
      order: options.order ?? { id: 'ASC' },
    });
  }

  async update(
    dto: PostPersonMappingDTO,
    updater: string | undefined,
    id: number,
  ): Promise<PostPersonMapping> {
    const existing = await this.postPersonMapping.findOne({ where: { id } });
    if (!existing) {
      throw new HttpException(
        'Post person mapping not found for update',
        HttpStatus.NOT_FOUND,
      );
    }
    if (dto.startDate !== undefined) existing.startDate = dto.startDate;
    if (dto.endDate !== undefined) existing.endDate = dto.endDate;
    if (updater) existing.updatedBy = updater;
    return this.postPersonMapping.save(existing);
  }

  async deleteById(id: number, postId?: string): Promise<void> {
    const where: { id: number; postId?: string } = { id };
    if (postId?.trim()) where.postId = postId.trim();
    const mapping = await this.postPersonMapping.findOne({ where });
    if (!mapping) {
      throw new HttpException(
        'Post person mapping not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const now = new Date();
    const formattedDate =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    mapping.status = PostPersonMappingStatus.INACTIVE;
    mapping.endDate = formattedDate;
    await this.postPersonMapping.save(mapping);
    // BDA-style: clear loginId on the user for this post
    await this.userRepository.update(
      { id: mapping.postId },
      { loginId: null as unknown as string },
    );
    this.logger.log(
      `User for post ${mapping.postId} loginId cleared (unmapped)`,
    );
  }

  /** BDA-style: returns { postPersonMapping, personDetails } or { success, message, data }. */
  async getPostPersonMapping(postId: string): Promise<{
    postPersonMapping?: PostPersonMapping;
    personDetails?: PersonalDetails | null;
    success?: boolean;
    message?: string;
    data?:
      | PostPersonMapping
      | {
          postPersonMapping: PostPersonMapping;
          personDetails: PersonalDetails | null;
        }
      | null;
  }> {
    const postPersonMapping = await this.postPersonMapping.findOne({
      where: { postId, status: PostPersonMappingStatus.ACTIVE },
    });
    if (!postPersonMapping) {
      return {
        success: true,
        message: `No active post person mapping found for post ID ${postId}`,
        data: null,
      };
    }
    const personDetails = await this.personalDetailsRepo.findOne({
      where: { id: postPersonMapping.personId },
    });
    return {
      postPersonMapping,
      personDetails: personDetails ?? null,
    };
  }

  async getUnmappedPersons(): Promise<
    Array<PersonalDetails & { postDetails?: PostDetails | null }>
  > {
    const personalDetails = await this.personalDetailsRepo.find();
    const postPersonMapping = await this.postPersonMapping.find({
      where: { status: PostPersonMappingStatus.ACTIVE },
    });
    const unmapped = personalDetails.filter(
      person =>
        !postPersonMapping.some(
          m =>
            m.personId === person.id &&
            m.status === PostPersonMappingStatus.ACTIVE,
        ),
    );
    return unmapped.map(person => ({
      ...person,
      postDetails: null,
    }));
  }

  async updateStatus(id: number): Promise<PostPersonMapping> {
    const mapping = await this.postPersonMapping.findOne({ where: { id } });
    if (!mapping) {
      throw new HttpException(
        'Post person mapping not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const now = new Date();
    const formattedDate =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    mapping.status = PostPersonMappingStatus.INACTIVE;
    mapping.endDate = formattedDate;
    const saved = await this.postPersonMapping.save(mapping);
    // BDA-style: clear loginId on the user for this post
    await this.userRepository.update(
      { id: mapping.postId },
      { loginId: null as unknown as string },
    );
    this.logger.log(
      `User for post ${mapping.postId} loginId cleared (status inactive)`,
    );
    return saved;
  }

  async getProcessHistory(
    options: IPaginationOptions,
    sort: string,
    postId: string,
  ): Promise<Pagination<PostPersonMapping>> {
    const dir = sort?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const qb = this.postPersonMapping
      .createQueryBuilder('mapping')
      .where('mapping.postId = :postId', { postId })
      .andWhere('mapping.status = :status', {
        status: PostPersonMappingStatus.INACTIVE,
      })
      .orderBy('mapping.id', dir);
    return paginate(qb, options);
  }

  async getPersonDetailsforthePostName(postName: string): Promise<{
    postPersonMapping: PostPersonMapping;
    personDetails: PersonalDetails;
  }> {
    const postDetails = await this.postDetailsRepo.findOne({
      where: [{ postName }, { roleName: postName }],
    });
    if (!postDetails) {
      throw new HttpException(
        `No post found for name ${postName}`,
        HttpStatus.NOT_FOUND,
      );
    }
    const postPersonMapping = await this.postPersonMapping.findOne({
      where: {
        postId: postDetails.id,
        status: PostPersonMappingStatus.ACTIVE,
      },
    });
    if (!postPersonMapping) {
      throw new HttpException(
        `No post person mapping found for post ${postName}`,
        HttpStatus.NOT_FOUND,
      );
    }
    const personDetails = await this.personalDetailsRepo.findOne({
      where: { id: postPersonMapping.personId },
    });
    if (!personDetails) {
      throw new HttpException(
        `No person details found for mapping`,
        HttpStatus.NOT_FOUND,
      );
    }
    return { postPersonMapping, personDetails };
  }

  async getAllMappingsWithDetails(
    options?: IPaginationOptions,
    status?: PostPersonMappingStatus,
    search?: string,
  ): Promise<
    | Pagination<{
        mappingDetails: PostPersonMapping;
        personDetails: PersonalDetails | null;
        postDetails: PostDetails | null;
      }>
    | {
        items: Array<{
          mappingDetails: PostPersonMapping;
          personDetails: PersonalDetails | null;
          postDetails: PostDetails | null;
        }>;
      }
  > {
    const qb = this.postPersonMapping.createQueryBuilder('mapping');
    if (status) {
      qb.where('mapping.status = :status', { status });
    }
    if (search?.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      const posts = await this.postDetailsRepo
        .createQueryBuilder('p')
        .where('LOWER(p.postName) LIKE :term', { term })
        .getMany();
      const persons = await this.personalDetailsRepo
        .createQueryBuilder('p')
        .where(
          'LOWER(p.firstName) LIKE :term OR LOWER(p.lastName) LIKE :term',
          { term },
        )
        .getMany();
      const postIds = posts.map(p => p.id);
      const personIds = persons.map(p => p.id);
      if (postIds.length === 0 && personIds.length === 0) {
        return options
          ? {
              items: [],
              meta: {
                itemCount: 0,
                totalItems: 0,
                itemsPerPage: 10,
                totalPages: 0,
                currentPage: 1,
              },
            }
          : { items: [] };
      }
      const searchWhere =
        postIds.length > 0 && personIds.length > 0
          ? '(mapping.postId IN (:...postIds) OR mapping.personId IN (:...personIds))'
          : postIds.length > 0
            ? 'mapping.postId IN (:...postIds)'
            : 'mapping.personId IN (:...personIds)';
      const searchParams =
        postIds.length > 0 && personIds.length > 0
          ? { postIds, personIds }
          : postIds.length > 0
            ? { postIds }
            : { personIds };
      if (status) {
        qb.andWhere(searchWhere, searchParams);
      } else {
        qb.where(searchWhere, searchParams);
      }
    }
    qb.orderBy('mapping.createdAt', 'DESC');

    if (options) {
      const paginated = await paginate<PostPersonMapping>(qb, options);
      const postIds = [...new Set(paginated.items.map(m => m.postId))];
      const personIds = [...new Set(paginated.items.map(m => m.personId))];
      const posts =
        postIds.length > 0
          ? await this.postDetailsRepo.find({ where: { id: In(postIds) } })
          : [];
      const persons =
        personIds.length > 0
          ? await this.personalDetailsRepo.find({
              where: { id: In(personIds) },
            })
          : [];
      const postMap = new Map(posts.map(p => [p.id, p]));
      const personMap = new Map(persons.map(p => [p.id, p]));
      const items = paginated.items.map(m => ({
        mappingDetails: m,
        personDetails: personMap.get(m.personId) ?? null,
        postDetails: postMap.get(m.postId) ?? null,
      }));
      return { ...paginated, items };
    }
    const all = await qb.getMany();
    const postIdsAll = [...new Set(all.map(m => m.postId))];
    const personIdsAll = [...new Set(all.map(m => m.personId))];
    const posts =
      postIdsAll.length > 0
        ? await this.postDetailsRepo.find({ where: { id: In(postIdsAll) } })
        : [];
    const persons =
      personIdsAll.length > 0
        ? await this.personalDetailsRepo.find({
            where: { id: In(personIdsAll) },
          })
        : [];
    const postMap = new Map(posts.map(p => [p.id, p]));
    const personMap = new Map(persons.map(p => [p.id, p]));
    const items = all.map(m => ({
      mappingDetails: m,
      personDetails: personMap.get(m.personId) ?? null,
      postDetails: postMap.get(m.postId) ?? null,
    }));
    return { items };
  }

  async findAll(): Promise<PostPersonMapping[]> {
    return this.postPersonMapping.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: number): Promise<PostPersonMapping> {
    const mapping = await this.postPersonMapping.findOne({ where: { id } });
    if (!mapping) {
      throw new HttpException(
        `Post person mapping not found for id ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return mapping;
  }

  async getByPostId(postId: string): Promise<PostPersonMapping | null> {
    return this.postPersonMapping.findOne({
      where: { postId, status: PostPersonMappingStatus.ACTIVE },
    });
  }

  async findMappingByPersonId(personId: string): Promise<PostPersonMapping> {
    const mapping = await this.postPersonMapping.findOne({
      where: {
        personId,
        status: PostPersonMappingStatus.ACTIVE,
      },
    });
    if (!mapping) {
      throw new HttpException(
        `No active post mapping for person ${personId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return mapping;
  }
}