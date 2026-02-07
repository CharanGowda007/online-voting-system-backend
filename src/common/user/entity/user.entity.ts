import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn ,Index} from 'typeorm';
import { UserType } from '../enums/user-type.enum';
import { UserStatus } from '../enums/user-status.enum';

@Entity('users')
@Index('IDX_UNIQUE_LOGIN_ID',['loginId'],{unique:true})
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique:true,nullable:false})
    loginId: string;

    @Column({ unique: true })
    aliasLoginName: string;

    @Column({
        type:'enum',
        enum:UserType,
    })
    userType:UserType;

    @Column({select:false,nullable:false})
    password:string;

    @Column({
        type:'enum',
        enum:UserStatus,
        default:UserStatus.Draft,
        nullable:false,
    })
    status:UserStatus;

    @Column({default:false,nullable:false})
    changePasswwordRequired:boolean;

    @Column({nullable:true})
    lastPasswordChanged:Date;
    
    @Column({default:true,nullable:true})
    resetRequired:boolean;

    @Column({nullable:true})
    mobileVerification:boolean
}
