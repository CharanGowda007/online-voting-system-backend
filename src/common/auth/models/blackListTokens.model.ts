import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blacklistedtokens')
export class BlackListedTokens {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async setExpiration(): Promise<void> {
    if (!this.expiresAt) {
      const expiresInHours = Number(process.env.REFRESH_EXPIRY) || 168;
      this.expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    }
  }
}
