import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ReservationCategory } from '../enums/reservation-category.enum';

@Entity('master_assembly_constituency')
export class MasterAC {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'assembly_code', unique: true })
  assemblyCode: number;

  @Column({ name: 'assembly_name', length: 150 })
  assemblyName: string;

  @Column({ name: 'parliament_code' })
  parliamentCode: number;

  @Column({
    type: 'enum',
    enum: ReservationCategory,
    default: ReservationCategory.GENERAL,
    name: 'reservation_category',
  })
  reservationCategory: ReservationCategory;

  @Column({ default: true })
  active: boolean;
}
