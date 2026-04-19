import { BaseEntity } from 'src/common/core/models/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('role_permission')
export class RolePermission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'permission_id' })
  permissionId: string;

  @Column({ name: 'valueYn', default: true })
  valueYn: boolean;
}
