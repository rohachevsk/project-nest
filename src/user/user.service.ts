import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private users: Repository<User>,
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
    return this.users.find();
  }

  async findOne(id: number) {
    const user = await this.users.findOneBy({ id });
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

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.users.remove(user);
  }
}
