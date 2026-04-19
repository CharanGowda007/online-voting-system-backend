import { BaseEntity } from '@/common/core/models/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post_hierarchy')
export class PostHierarchy extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'office_details_id' })
  officeDetailsId: string;

  @Column({ name: 'manager_ofc_id' })
  managerOfcId: number;
}