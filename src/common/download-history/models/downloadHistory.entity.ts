import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('download_history')
export class DownloadHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_key' })
  fileKey: string;

  @Column({ name: 'file_name', nullable: true })
  fileName: string;

  @Column()
  module: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: number;

  @Column({ name: 'downloaded_by' })
  downloadedBy: string;

  @Column({
    name: 'downloaded_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  downloadedAt: Date;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string;
}