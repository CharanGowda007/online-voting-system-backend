import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('master_state')
export class MasterState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'state_code', unique: true })
  stateCode: number;

  @Column({ name: 'country_code' })
  countryCode: number;

  @Column({ name: 'state_name', length: 100 })
  stateName: string;

  @Column({ default: true })
  active: boolean;
}
