import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleMenu } from '../entity/roleMenu.entity';

@Injectable()
export class RoleMenuService {
  private readonly logger = new Logger(RoleMenuService.name);

  constructor(
    @InjectRepository(RoleMenu)
    private roleMenuRepo: Repository<RoleMenu>,
  ) {}
}

