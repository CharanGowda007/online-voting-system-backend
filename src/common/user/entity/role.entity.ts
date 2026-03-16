import {BaseEntity} from 'src/common/core/models/base.entity';
import {Column,Entity,PrimaryGeneratedColumn} from 'typeorm';

@Entity('role')
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn()
    id:number;

    @Column({name:'code',length:20})
    code:string;

    @Column({name:'name',length:50})
    name:string;
}