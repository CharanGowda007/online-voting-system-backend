import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @Column({ name: 'login_id', nullable: false })
  loginId: string;

  @Column({ name: 'login_time', type: 'timestamp', nullable: true })
  loginTime: Date;

  @Column({ name: 'logout_time', type: 'timestamp', nullable: true })
  logoutTime: Date;

  @Column({ name: 'location_id', type: 'int', nullable: true })
  locationId: number;

  @Column({ name: 'post_id', type: 'varchar', length: 255, nullable: true })
  postId: string;
}

