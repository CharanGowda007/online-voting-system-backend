import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Brackets } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { SeriesGeneratorService } from 'src/series-generator/service/series-generator.service';
import { User } from '@/common/user/entity/user.entity';
import { PersonalDetails } from '../models/personalDetails.entity';
import { PostPersonMapping } from '../models/postPersonMapping.entity';
import { PostDetails } from '../models/postDetails.entity';
import {
  CreatePersonalDetailsDto,
  PersonalDetailsQueryDto,
} from '../dto/personalDetails.dto';
import { RegisterUserByMobileDto } from '../dto/registerUserByMobile.dto';
import { PostPersonMappingStatus } from '../enums/postPersonMappingStatus';
import { PersonUniqueIdPrefix } from '../enums/person-unique-id-prefix.enum';

const PERSON_UNIQUE_ID_PREFIX = PersonUniqueIdPrefix.OVS;

/** Person with loginId (alias for personUniqueId) and designation (post name) for dropdowns. */
export interface PersonWithLoginIdAndDesignation extends PersonalDetails {
  loginId?: string;
  designation?: string;
}

@Injectable()
export class UserAdminPersonalDetailsService {
  private readonly logger = new Logger(UserAdminPersonalDetailsService.name);

  constructor(
    @InjectRepository(PersonalDetails)
    private userAdminPersonalDetailsRepository: Repository<PersonalDetails>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PostPersonMapping)
    private postPersonMappingRepository: Repository<PostPersonMapping>,
    @InjectRepository(PostDetails)
    private postDetailsRepository: Repository<PostDetails>,
    private readonly seriesGeneratorService: SeriesGeneratorService,
  ) {}

  async create(dto: CreatePersonalDetailsDto): Promise<PersonalDetails> {
    const personUniqueId =
      dto.personUniqueId?.trim() ||
      (await this.seriesGeneratorService.generateAndSavePrefix(
        PERSON_UNIQUE_ID_PREFIX,
      ));

    const person = this.userAdminPersonalDetailsRepository.create({
      firstName: dto.firstName ?? '',
      lastName: dto.lastName,
      email: dto.email,
      mobileNumber: dto.mobileNumber,
      districtId: dto.districtId,
      districtName: dto.districtName,
      talukaId: dto.talukaId,
      talukaName: dto.talukaName,
      personUniqueId,
      department: dto.department,
      departmentId: dto.departmentId,
      gender: dto.gender,
      state: dto.state,
      status: dto.status,
    });
    return this.userAdminPersonalDetailsRepository.save(person);
  }

  /**
   * Seed N person details. Each gets auto-generated personUniqueId (CAS000001, CAS000002, ...).
   * @param count number of persons to create (default 50)
   */
  async seed(
    count: number = 50,
  ): Promise<{ created: number; message: string }> {
    const created: PersonalDetails[] = [];
    for (let i = 0; i < count; i++) {
      const dto: CreatePersonalDetailsDto = {
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        email: `person${i + 1}@example.com`,
        mobileNumber: `9876543${String(i).padStart(3, '0')}`,
        districtName: 'Bangalore',
        department: 'CAS Department',
        state: 'Karnataka',
        status: 'active',
      };
      const person = await this.create(dto);
      created.push(person);
    }
    return {
      created: created.length,
      message: `Created ${created.length} person details. personUniqueId assigned as CAS000001, CAS000002, ...`,
    };
  }

  /**
   * Get designation (post name) per person for the given person IDs.
   * Uses active post-person mapping; first post per person is used as designation.
   */
  private async getDesignationsByPersonIds(
    personIds: string[],
  ): Promise<Map<string, string>> {
    if (personIds.length === 0) return new Map();
    const mappings = await this.postPersonMappingRepository.find({
      where: {
        personId: In(personIds),
        status: PostPersonMappingStatus.ACTIVE,
      },
      select: ['personId', 'postId'],
    });
    if (mappings.length === 0) return new Map();
    const postIds = [...new Set(mappings.map(m => m.postId))];
    const posts = await this.postDetailsRepository.find({
      where: { id: In(postIds) },
      select: ['id', 'postName'],
    });
    const postNameById = new Map(posts.map(p => [p.id, p.postName]));
    const map = new Map<string, string>();
    for (const m of mappings) {
      if (!map.has(m.personId)) {
        const name = postNameById.get(m.postId);
        if (name) map.set(m.personId, name);
      }
    }
    return map;
  }

  /**
   * Build display label for History table: "Name (loginId) – Designation".
   * Used for performed_by and sent_to when recording notification history.
   */
  async getDisplayLabelByLoginId(loginId: string): Promise<string> {
    if (!loginId?.trim()) return '';
    const person = await this.getPersonalDetailsByLoginId(loginId.trim());
    return this.buildDisplayLabelForPerson(person || undefined);
  }

  /**
   * Build display label for a person identified by person id (UUID) or loginId (personUniqueId).
   * Returns "Name (loginId) – Designation" or the raw idOrLoginId if person not found.
   */
  async getDisplayLabelByPersonIdOrLoginId(
    idOrLoginId: string,
  ): Promise<string> {
    if (!idOrLoginId?.trim()) return '';
    const id = idOrLoginId.trim();
    let person = await this.userAdminPersonalDetailsRepository.findOne({
      where: { id },
    });
    if (!person) {
      person = await this.userAdminPersonalDetailsRepository.findOne({
        where: { personUniqueId: id },
      });
    }
    return this.buildDisplayLabelForPerson(person || undefined);
  }

  /**
   * Split name and designation for history / task UIs (avoids parsing the combined display line).
   */
  async getPersonNameAndDesignationByPersonIdOrLoginId(
    idOrLoginId: string,
  ): Promise<{ name: string; designation: string; loginId: string }> {
    if (!idOrLoginId?.trim()) {
      return { name: '', designation: '', loginId: '' };
    }
    const id = idOrLoginId.trim();
    let person = await this.userAdminPersonalDetailsRepository.findOne({
      where: { id },
    });
    if (!person) {
      person = await this.userAdminPersonalDetailsRepository.findOne({
        where: { personUniqueId: id },
      });
    }
    if (!person) {
      return { name: id, designation: '', loginId: '' };
    }
    const name =
      [person.firstName, person.lastName].filter(Boolean).join(' ').trim() ||
      person.personUniqueId ||
      person.id;
    const designations = await this.getDesignationsByPersonIds([person.id]);
    const designation = designations.get(person.id) || '';
    const loginId = person.personUniqueId?.trim() || '';
    return { name, designation, loginId };
  }

  private async buildDisplayLabelForPerson(
    person: PersonalDetails | undefined,
  ): Promise<string> {
    if (!person) return '';
    const name =
      [person.firstName, person.lastName].filter(Boolean).join(' ').trim() ||
      person.personUniqueId ||
      person.id;
    const loginId = person.personUniqueId?.trim() || '';
    const designations = await this.getDesignationsByPersonIds([person.id]);
    const designation = designations.get(person.id) || '';
    if (designation) {
      return loginId
        ? `${name} (${loginId}) – ${designation}`
        : `${name} – ${designation}`;
    }
    return loginId ? `${name} (${loginId})` : name;
  }

  async findAll(
    query?: PersonalDetailsQueryDto,
  ): Promise<
    | Pagination<PersonalDetails>
    | Pagination<PersonWithLoginIdAndDesignation>
    | PersonalDetails[]
  > {
    try {
      if (!query) {
        return this.userAdminPersonalDetailsRepository.find({
          order: { createdAt: 'DESC' },
        });
      }

      const { search, page, limit, userType } = query;
      const queryBuilder =
        this.userAdminPersonalDetailsRepository.createQueryBuilder('person');

      if (userType?.trim()) {
        queryBuilder
          .innerJoin(User, 'u', 'u.loginId = person.personUniqueId')
          .andWhere('u.userType = :userType', {
            userType: userType.trim().toLowerCase(),
          });
      }

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('LOWER(person.firstName) LIKE LOWER(:search)', {
              search: `%${search}%`,
            })
              .orWhere('LOWER(person.lastName) LIKE LOWER(:search)', {
                search: `%${search}%`,
              })
              .orWhere('LOWER(person.email) LIKE LOWER(:search)', {
                search: `%${search}%`,
              })
              .orWhere('LOWER(person.mobileNumber) LIKE LOWER(:search)', {
                search: `%${search}%`,
              })
              .orWhere('LOWER(person.personUniqueId) LIKE LOWER(:search)', {
                search: `%${search}%`,
              });
          }),
        );
      }

      queryBuilder.orderBy('person.createdAt', 'DESC');

      const options: IPaginationOptions = {
        page: page ?? 1,
        limit: limit ?? 10,
      };

      const result = await paginate<PersonalDetails>(queryBuilder, options);

      if (userType?.trim() && result.items?.length > 0) {
        const personIds = result.items.map(p => p.id);
        const designationsByPersonId =
          await this.getDesignationsByPersonIds(personIds);
        const enrichedItems: PersonWithLoginIdAndDesignation[] =
          result.items.map(p => ({
            ...p,
            loginId: p.personUniqueId ?? undefined,
            designation: designationsByPersonId.get(p.id),
          }));
        return { ...result, items: enrichedItems };
      }

      return result;
    } catch (error) {
      this.logger.error(`Error fetching persons: ${(error as Error).message}`);
      throw new HttpException(
        (error as Error).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPersonalDetailsByLoginId(
    loginId: string,
  ): Promise<PersonalDetails | null> {
    try {
      this.logger.log(`Fetching personal details by loginId: ${loginId}`);
      return await this.userAdminPersonalDetailsRepository.findOne({
        where: { personUniqueId: loginId },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch personal details by loginId ${loginId}: ${(error as Error).message}`,
      );
      throw new HttpException(
        (error as Error).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPeronalDetailsByUserIds(
    ids: string[],
  ): Promise<PersonalDetails[]> {
    try {
      return await this.userAdminPersonalDetailsRepository.find({
        where: { id: In(ids) },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch personal details by ids: ${(error as Error).message}`,
      );
      throw new HttpException(
        (error as Error).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(personUniqueId: string): Promise<PersonalDetails | null> {
    return this.userAdminPersonalDetailsRepository.findOne({
      where: { personUniqueId },
    });
  }

  async findOneById(id: string): Promise<PersonalDetails> {
    const person = await this.userAdminPersonalDetailsRepository.findOne({
      where: { id },
    });
    if (!person) {
      throw new HttpException(
        `Person with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return person;
  }

  /**
   * Find personal details (user) by mobile number.
   * Used for user register / get by mobile.
   */
  async findByMobileNumber(
    mobileNumber: string,
  ): Promise<PersonalDetails | null> {
    const normalized = mobileNumber?.trim().replace(/\s/g, '');
    if (!normalized) return null;
    return this.userAdminPersonalDetailsRepository.findOne({
      where: { mobileNumber: normalized },
    });
  }

  /**
   * Register user by mobile number. If mobile already exists, returns existing record.
   * Otherwise creates a new personal detail (user) with auto-generated personUniqueId.
   */
  async registerUserByMobile(
    dto: RegisterUserByMobileDto,
  ): Promise<PersonalDetails> {
    const mobileNumber = dto.mobileNumber?.trim().replace(/\s/g, '') || '';
    if (!mobileNumber) {
      throw new HttpException(
        'Mobile number is required for user registration',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existing = await this.findByMobileNumber(mobileNumber);
    if (existing) {
      this.logger.log(
        `User already registered for mobile ${mobileNumber}, returning existing record`,
      );
      return existing;
    }
    const personUniqueId =
      await this.seriesGeneratorService.generateAndSavePrefix(
        PERSON_UNIQUE_ID_PREFIX,
      );
    const person = this.userAdminPersonalDetailsRepository.create({
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? 'User',
      email: dto.email ?? `${mobileNumber}@user.ovs.local`,
      mobileNumber,
      districtName: dto.districtName,
      talukaName: dto.talukaName,
      personUniqueId,
      gender: dto.gender,
      state: dto.state,
      status: 'active',
    });
    return this.userAdminPersonalDetailsRepository.save(person);
  }
}