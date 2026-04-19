import { BaseEntity } from '@/common/core/models/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PostPersonMappingStatus } from '../enums/postPersonMappingStatus';

@Entity('post_person_mapping')
export class PostPersonMapping extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id', type: 'varchar', length: 36 })
  postId: string;

  @Column({ name: 'person_id', type: 'varchar', length: 36 })
  personId: string;

  @Column({ name: 'start_date', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', nullable: true })
  endDate: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PostPersonMappingStatus,
    default: PostPersonMappingStatus.ACTIVE,
  })
  status: PostPersonMappingStatus;
}