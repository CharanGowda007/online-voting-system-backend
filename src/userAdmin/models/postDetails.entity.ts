import { BaseEntity } from '@/common/core/models/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post_details')
export class PostDetails extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  postName: string;

  @Column({ nullable: false })
  departmentName: string;

  @Column({ nullable: false })
  roleId: number;

  @Column({ nullable: false })
  roleName: string;

  @Column({ nullable: false })
  locationId: number;

  @Column({ nullable: false })
  location: string;

  @Column({ nullable: false })
  ofcAddress: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  phoneNumber: string;

  @Column({ nullable: true })
  postId: string;

  @Column({ nullable: true })
  aliasName: string;
}