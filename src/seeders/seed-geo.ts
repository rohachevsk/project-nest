import dataSource from '../data-source.js';
import { syncGeo } from '../geo/geo-sync.js';

const maxCities = Number(process.env.GEO_MAX_CITIES ?? 30);

async function seedGeo(): Promise<void> {
  await dataSource.initialize();

  try {
    const result = await syncGeo(dataSource, maxCities);
    console.log(
      `Geo seeded: ${result.countries} countries, ${result.cities} cities`,
    );
  } finally {
    await dataSource.destroy();
  }
}

void seedGeo().catch((error: unknown) => {
  console.error('Failed to seed geo:', error);
  process.exitCode = 1;
});
