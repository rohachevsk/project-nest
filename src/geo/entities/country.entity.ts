import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { City } from './city.entity.js';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', length: 2, unique: true })
  iso2: string;

  @Column({ type: 'varchar', length: 3, unique: true })
  iso3: string;

  @Column({ type: 'varchar', nullable: true })
  phone_code: string | null;

  @Column({ type: 'float', nullable: true })
  latitude: number | null;

  @Column({ type: 'float', nullable: true })
  longitude: number | null;

  @OneToMany(() => City, (city) => city.country)
  cities: Relation<City>[];
}
