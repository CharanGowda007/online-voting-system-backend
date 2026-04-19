import { BaseEntity } from '@/common/core/models/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('personal_details')
export class PersonalDetails extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', length: 100, nullable: false })
  lastName: string;

  @Column({ name: 'email', length: 100, nullable: false })
  email: string;

  @Column({ name: 'mobile_number', length: 20, nullable: true })
  mobileNumber: string;

  @Column({ name: 'district_id', type: 'int', nullable: true })
  districtId: number;

  @Column({ name: 'district_name', length: 100, nullable: true })
  districtName: string;

  @Column({ name: 'taluka_id', type: 'int', nullable: true })
  talukaId: number;

  @Column({ name: 'taluka_name', length: 100, nullable: true })
  talukaName: string;

  @Column({ name: 'personUniqueId', length: 20, nullable: true })
  personUniqueId: string;

  @Column({ name: 'department', length: 100, nullable: true })
  department: string;

  @Column({ name: 'department_id', type: 'int', nullable: true })
  departmentId: number;

  @Column({ name: 'gender', length: 100, nullable: true })
  gender: string;

  @Column({ name: 'state', length: 100, nullable: true })
  state: string;

  @Column({ name: 'status', length: 100, nullable: true })
  status: string;
}