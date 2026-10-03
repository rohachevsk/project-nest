import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Role } from '../role/entities/role.entity.js';
import { HashHelper } from './helpers/hash.helper.js';
import { GeoModule } from '../geo/geo.module.js';

@Module({
  // Role без власного модуля: реєструємо тут, інакше autoLoadEntities
  // не бачить Role і старт падає з "Entity metadata for User#role was not found".
  imports: [TypeOrmModule.forFeature([User, Role]), GeoModule],
  controllers: [UserController],
  providers: [UserService, HashHelper],
  exports: [HashHelper],
})
export class UserModule {}
