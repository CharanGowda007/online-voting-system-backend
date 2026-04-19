import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entity/role.entity';
import { CreateRoleDto } from '../dto/role.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    private readonly masterRoleRepository: Repository<Role>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.masterRoleRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new HttpException(
        `Role with code '${dto.code}' already exists`,
        HttpStatus.CONFLICT,
      );
    }
    const role = this.masterRoleRepository.create(dto);
    return this.masterRoleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.masterRoleRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Role> {
    const result = await this.masterRoleRepository.findOne({
      where: { id },
    });
    if (!result) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
