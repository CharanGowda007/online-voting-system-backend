import { BaseDTO } from 'src/userAdmin/dto/base.dto';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { UserStatus } from '../enums/userStatus.enum';
import { UserType } from '../enums/userTypes.enum';

@Entity('users')
@Index('IDX_UNIQUE_LOGIN_ID', ['loginId'], { unique: true })
export class User extends BaseDTO {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ unique: true, nullable: true })
  loginId: string;

  @Column({ type: 'enum', enum: UserType })
  userType: UserType;

  @Column({ select: true, nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.DRAFT,
    nullable: false,
  })
  status: UserStatus;

  @Column({ nullable: true })
  lastLoggedIn: Date;

  @Column({ nullable: true })
  lastLoggedOut: Date;

  @Column({ default: false, nullable: false })
  changePasswordRequired: boolean;

  @Column({ nullable: true })
  lastPasswordChanged: Date;

  @Column({ nullable: true })
  resetRequired: boolean;

  @Column({ nullable: true })
  mobileVerification: boolean;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  randomPassword: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  aliasName: string;
}