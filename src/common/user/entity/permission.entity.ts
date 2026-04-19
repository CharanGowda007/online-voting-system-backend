import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PermissionStatus } from '../enums/userPermissionStatus.enum';

@Entity('permission')
export class Permission {
  @PrimaryColumn({ nullable: false, length: 100 })
  id: string;

  @Column({ nullable: false, length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: PermissionStatus,
    default: PermissionStatus.ACTIVE,
    nullable: false,
  })
  status: PermissionStatus;

  @Column({ nullable: true })
  createdBy?: string;

  @CreateDateColumn({ nullable: true })
  createdAt?: Date;

  @Column({ nullable: true })
  updatedBy?: string;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;
}
