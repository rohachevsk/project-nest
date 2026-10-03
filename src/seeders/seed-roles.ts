import dataSource from '../data-source.js';
import { Role } from '../role/entities/role.entity.js';

const roles = ['admin', 'user'];

async function seedRoles(): Promise<void> {
  await dataSource.initialize();

  try {
    await dataSource
      .getRepository(Role)
      .upsert(roles.map((name) => ({ name })), ['name']);
  } finally {
    await dataSource.destroy();
  }
}

void seedRoles().catch((error: unknown) => {
  console.error('Failed to seed roles:', error);
  process.exitCode = 1;
});
