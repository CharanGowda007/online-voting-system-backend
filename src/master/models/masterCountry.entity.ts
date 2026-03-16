import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('master_country')
export class MasterCountry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'country_code', unique: true })
  countryCode: number;

  @Column({ name: 'country_name', length: 100 })
  countryName: string;

  @Column({ default: true })
  active: boolean;
}
