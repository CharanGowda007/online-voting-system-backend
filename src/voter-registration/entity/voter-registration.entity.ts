import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Gender } from '../enums/voter.enums';
import { BaseEntity } from 'src/common/core/models/base.entity';

@Entity('voter_registrations')
export class VoterRegistration extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'applicant_name' })
  applicantName: string;

  @Column({ name: 'relative_name' })
  relativeName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: string;

  @Column()
  gender: Gender;

  @Column({ length: 10 })
  mobile: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'aadhaar_number',unique:true, nullable: false, length: 12 })
  aadhaarNumber: string;

  @Column({ name: 'street_address' })
  streetAddress: string;

  @Column({ name: 'village_town' })
  villageTown: string;

  @Column({ name: 'post_office' })
  postOffice: string;

  @Column({ length: 6 })
  pincode: string;

  @Column()
  tehsil: string;

  @Column()
  district: string;

  @Column({ name: 'state_code' })
  stateCode: number;

  @Column({ name: 'place_of_birth' })
  placeOfBirth: string;

  @Column({ name: 'pc_code' })
  pcCode: number;

  @Column({ name: 'ac_code' })
  acCode: number;

}
