import { BaseEntity } from '@/common/core/models/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post_permission_limit')
export class PostPermissionLimit extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', name: 'post_id' })
  postId: string;

  @Column({ type: 'integer', name: 'role_id' })
  roleId: number;

  @Column({ type: 'varchar', name: 'permission_id' })
  permissionId: string;

  @Column({ type: 'integer', name: 'value', nullable: true })
  value: number;

  @Column({ type: 'boolean', name: 'can_approve', nullable: true })
  canApprove: boolean;
}