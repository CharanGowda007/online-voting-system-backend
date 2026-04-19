import {Column,Entity,PrimaryGeneratedColumn} from 'typeorm';

@Entity('series_generator')
export class SeriesGenerator{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    prefix:string;

    @Column()
    value:string;
}