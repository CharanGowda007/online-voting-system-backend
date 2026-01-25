import {Entity,Column,PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn} from "typeorm";

@Entity("password_reset_tokens")
export class PasswordResetToken {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    token:string;

    @Column()
    userId:number;

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;
}