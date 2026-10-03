import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateDeliveryAddressDto } from './dto/update-delivery-address.dto.js';
import { Country } from '../geo/entities/country.entity.js';
import { City } from '../geo/entities/city.entity.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private users: Repository<User>,
    @InjectRepository(Country)
    private countries: Repository<Country>,
    @InjectRepository(City)
    private cities: Repository<City>,
  ) {}

  async create(dto: CreateUserDto) {
    const user = new User();
    user.email = dto.email;
    user.name = dto.name;
    user.password = dto.password;
    user.is_active = dto.is_active;
    return this.users.save(user);
  }

  findAll() {
    return this.users.find({ relations: { country: true, city: true } });
  }

  async findOne(id: number) {
    const user = await this.users.findOne({
      where: { id },
      relations: { country: true, city: true },
    });
    if (user === null) {
      throw new NotFoundException('User with id ' + id + ' not found');
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (dto.email) {
      user.email = dto.email;
    }
    if (dto.name) {
      user.name = dto.name;
    }
    if (dto.password) {
      user.password = dto.password;
    }
    if (dto.is_active !== undefined) {
      user.is_active = dto.is_active;
    }
    return this.users.save(user);
  }

  async updateDeliveryAddress(id: number, dto: UpdateDeliveryAddressDto) {
    const user = await this.users.findOne({
      where: { id },
      relations: { country: true, city: true },
    });
    if (user === null) {
      throw new NotFoundException('User with id ' + id + ' not found');
    }

    if (dto.countryId !== undefined) {
      if (dto.countryId === null) {
        user.country = null;
      } else {
        const country = await this.countries.findOneBy({
          id: dto.countryId,
        });
        if (country === null) {
          throw new NotFoundException(
            'Country with id ' + dto.countryId + ' not found',
          );
        }
        user.country = country;
      }
    }

    if (dto.cityId !== undefined) {
      if (dto.cityId === null) {
        user.city = null;
      } else {
        const city = await this.cities.findOne({
          where: { id: dto.cityId },
          relations: { country: true },
        });
        if (city === null) {
          throw new NotFoundException(
            'City with id ' + dto.cityId + ' not found',
          );
        }
        const finalCountryId =
          dto.countryId ?? (user.country as Country | null)?.id ?? null;
        if (
          finalCountryId !== null &&
          city.country.id !== finalCountryId
        ) {
          throw new BadRequestException('City does not belong to country');
        }
        user.city = city;
        if (dto.countryId === undefined && city.country) {
          user.country = city.country;
        }
      }
    }

    if (dto.street !== undefined) {
      user.street = dto.street;
    }
    if (dto.postalCode !== undefined) {
      user.postal_code = dto.postalCode;
    }

    return this.users.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.users.remove(user);
  }
}
