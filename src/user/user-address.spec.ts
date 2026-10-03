import { describe, expect, it, vi } from 'vitest';
import { getMetadataArgsStorage } from 'typeorm';
import { validate } from 'class-validator';
import { User } from './entities/user.entity.js';
import { Country } from '../geo/entities/country.entity.js';
import { City } from '../geo/entities/city.entity.js';
import { UserService } from './user.service.js';
import { UpdateDeliveryAddressDto } from './dto/update-delivery-address.dto.js';
import { isExcludedCountry } from '../geo/geo-sync.js';

function relationsOf(target: object, propertyName: string) {
  return getMetadataArgsStorage().relations.filter(
    (r) => r.target === target && r.propertyName === propertyName,
  );
}

function columnsOf(target: object, propertyName: string) {
  return getMetadataArgsStorage().columns.filter(
    (c) => c.target === target && c.propertyName === propertyName,
  );
}

describe('User delivery address: entity', () => {
  it('User.country — ManyToOne на Country через country_id', () => {
    const relations = relationsOf(User, 'country');
    expect(relations).toHaveLength(1);
    expect(relations[0].relationType).toBe('many-to-one');
  });

  it('User.city — ManyToOne на City через city_id', () => {
    const relations = relationsOf(User, 'city');
    expect(relations).toHaveLength(1);
    expect(relations[0].relationType).toBe('many-to-one');
  });

  it('User имеет колонки street и postal_code', () => {
    expect(columnsOf(User, 'street')).toHaveLength(1);
    expect(columnsOf(User, 'postal_code')).toHaveLength(1);
  });
});

describe('Geo entities: Country + City', () => {
  it('Country — @Entity countries с расширенными полями', () => {
    const tables = getMetadataArgsStorage().tables.filter(
      (t) => t.target === Country,
    );
    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe('countries');
    for (const prop of [
      'name',
      'iso2',
      'iso3',
      'phone_code',
      'latitude',
      'longitude',
    ]) {
      expect(columnsOf(Country, prop)).toHaveLength(1);
    }
  });

  it('City — @Entity cities, ManyToOne на Country', () => {
    const tables = getMetadataArgsStorage().tables.filter(
      (t) => t.target === City,
    );
    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe('cities');
    const relations = relationsOf(City, 'country');
    expect(relations).toHaveLength(1);
    expect(relations[0].relationType).toBe('many-to-one');
  });
});

describe('Geo sync: исключение России', () => {
  it('RU / RUS / Russian Federation исключены', () => {
    expect(isExcludedCountry('RU')).toBe(true);
    expect(isExcludedCountry('ru')).toBe(true);
    expect(isExcludedCountry('Russian Federation')).toBe(true);
  });

  it('UA и другие страны не исключены', () => {
    expect(isExcludedCountry('UA')).toBe(false);
    expect(isExcludedCountry('Ukraine')).toBe(false);
    expect(isExcludedCountry('PL')).toBe(false);
  });
});

describe('UpdateDeliveryAddressDto: валидация', () => {
  it('валидный DTO без ошибок', async () => {
    const dto = new UpdateDeliveryAddressDto();
    dto.countryId = 1;
    dto.cityId = 2;
    dto.street = 'Khreshchatyk 1';
    dto.postalCode = '01001';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('невалидный DTO: отрицательный countryId и длинная улица', async () => {
    const dto = new UpdateDeliveryAddressDto();
    dto.countryId = -5;
    dto.street = 'x'.repeat(300);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UserService.updateDeliveryAddress', () => {
  function makeService() {
    const users = {
      findOne: vi.fn(),
      save: vi.fn((u: unknown) => Promise.resolve(u)),
    };
    const countries = { findOneBy: vi.fn() };
    const cities = { findOne: vi.fn() };
    const service = new UserService(
      users as never,
      countries as never,
      cities as never,
    );
    return { service, users, countries, cities };
  }

  it('успешно привязывает страну+город+улицу', async () => {
    const { service, users, countries, cities } = makeService();
    const user = new User();
    user.id = 1;
    users.findOne.mockResolvedValue(user);
    countries.findOneBy.mockResolvedValue({ id: 1 });
    cities.findOne.mockResolvedValue({ id: 10, country: { id: 1 } });
    const result = await service.updateDeliveryAddress(1, {
      countryId: 1,
      cityId: 10,
      street: 'Shevchenka 5',
      postalCode: '79000',
    });
    expect(result.street).toBe('Shevchenka 5');
    expect(users.save).toHaveBeenCalledOnce();
  });

  it('404 если страны нет', async () => {
    const { service, users, countries } = makeService();
    users.findOne.mockResolvedValue(new User());
    countries.findOneBy.mockResolvedValue(null);
    await expect(
      service.updateDeliveryAddress(1, { countryId: 999 }),
    ).rejects.toThrow();
  });

  it('400 если город не из этой страны', async () => {
    const { service, users, countries, cities } = makeService();
    users.findOne.mockResolvedValue(new User());
    countries.findOneBy.mockResolvedValue({ id: 1 });
    cities.findOne.mockResolvedValue({ id: 10, country: { id: 2 } });
    await expect(
      service.updateDeliveryAddress(1, { countryId: 1, cityId: 10 }),
    ).rejects.toThrow();
  });
});
