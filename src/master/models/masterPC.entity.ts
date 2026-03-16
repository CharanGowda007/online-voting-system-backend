import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ReservationCategory } from '../enums/reservation-category.enum';

@Entity('master_parliamentary_constituency')
export class MasterPC {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pc_code', unique: true })
  pcCode: number;

  @Column({ name: 'parliament_name', length: 150 })
  parliamentName: string;

  @Column({ name: 'state_code' })
  stateCode: number;

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
