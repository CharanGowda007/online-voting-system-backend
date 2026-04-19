import { BaseEntity } from '@/common/core/models/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post_manager_mapping')
export class PostManagerMapping extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id', type: 'varchar' })
  postId: string;

  @Column({ name: 'manager_id', type: 'varchar' })
  managerId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;
}