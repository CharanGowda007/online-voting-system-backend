import { BaseEntity } from '@/common/core/models/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post_permission')
export class PostPermission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'post_id' })
  postId: string;

  @Column({ type: 'integer', name: 'role_id' })
  roleId: number;

  @Column({ type: 'varchar', name: 'permission_id' })
  permissionId: string;
}