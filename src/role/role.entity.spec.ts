import { describe, expect, it } from 'vitest';
import { getMetadataArgsStorage } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';
import { User } from '../user/entities/user.entity.js';
import { UserModule } from '../user/user.module.js';

describe('Role (перенос из project-nest_241)', () => {
  it('entity Role зарегистрирована на таблицу role с уникальным name', () => {
    const storage = getMetadataArgsStorage();
    const tables = storage.tables.filter((t) => t.target === Role);
    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe('role');

    const columns = storage.columns.filter((c) => c.target === Role);
    const props = columns.map((c) => c.propertyName);
    expect(props).toContain('id');
    expect(props).toContain('name');
    const nameCol = columns.find((c) => c.propertyName === 'name');
    expect(nameCol?.options.unique).toBe(true);
  });

  it('User.role — ManyToOne на Role через role_id', () => {
    const storage = getMetadataArgsStorage();
    const relations = storage.relations.filter(
      (r) => r.target === User && r.propertyName === 'role',
    );
    expect(relations).toHaveLength(1);
    expect(relations[0].relationType).toBe('many-to-one');

    const joinCols = storage.joinColumns.filter(
      (j) => j.target === User && j.propertyName === 'role',
    );
    expect(joinCols).toHaveLength(1);
    expect(joinCols[0].name).toBe('role_id');
  });

  it('Role.users — OneToMany на User', () => {
    const storage = getMetadataArgsStorage();
    const relations = storage.relations.filter(
      (r) => r.target === Role && r.propertyName === 'users',
    );
    expect(relations).toHaveLength(1);
    expect(relations[0].relationType).toBe('one-to-many');
  });

  it('Role зареєстрована в Nest-модулі (репозиторій доступний через UserModule)', () => {
    // Без цього AppModule з autoLoadEntities не бачить Role
    // і падає з "Entity metadata for User#role was not found".
    const imports: Array<{ providers?: Array<{ provide?: unknown }> }> =
      Reflect.getMetadata('imports', UserModule) ?? [];
    const provides = imports.flatMap((m) =>
      (m.providers ?? []).map((p) => p.provide),
    );
    expect(provides).toContain(getRepositoryToken(Role));
  });
});
