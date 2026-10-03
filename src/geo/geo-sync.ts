import type { DataSource } from 'typeorm';
import { Country } from './entities/country.entity.js';
import { City } from './entities/city.entity.js';

const EXCLUDED_ISO2 = new Set(['RU']);
const EXCLUDED_NAMES = new Set(['russia', 'russian federation']);

export function isExcludedCountry(input: string): boolean {
  const v = input.trim().toLowerCase();
  if (v.length === 2) {
    return EXCLUDED_ISO2.has(v.toUpperCase());
  }
  return EXCLUDED_NAMES.has(v);
}

interface RestCountry {
  name?: { common?: string };
  cca2?: string;
  cca3?: string;
  idd?: { root?: string; suffixes?: string[] };
  latlng?: [number, number];
}

interface CountriesNowItem {
  country: string;
  cities: string[];
}

function phoneCodeOf(c: RestCountry): string | null {
  const root = c.idd?.root ?? '';
  const suffix = c.idd?.suffixes?.[0] ?? '';
  const code = `${root}${suffix}`.trim();
  return code === '' ? null : code;
}

export async function syncGeo(
  dataSource: DataSource,
  maxCitiesPerCountry = 30,
): Promise<{ countries: number; cities: number }> {
  const [restRes, nowRes] = await Promise.all([
    fetch(
      'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,idd,latlng',
    ),
    fetch('https://countriesnow.space/api/v0.1/countries'),
  ]);
  if (!restRes.ok) {
    throw new Error(`restcountries failed: ${restRes.status}`);
  }
  if (!nowRes.ok) {
    throw new Error(`countriesnow failed: ${nowRes.status}`);
  }
  const rest = (await restRes.json()) as RestCountry[];
  const nowJson = (await nowRes.json()) as {
    data?: CountriesNowItem[];
  };
  const citiesByCountry = new Map<string, string[]>();
  for (const item of nowJson.data ?? []) {
    citiesByCountry.set(item.country.toLowerCase(), item.cities ?? []);
  }

  const countryRepo = dataSource.getRepository(Country);
  const cityRepo = dataSource.getRepository(City);

  let countryCount = 0;
  let cityCount = 0;

  for (const c of rest) {
    const name = c.name?.common?.trim();
    const iso2 = c.cca2?.trim().toUpperCase();
    const iso3 = c.cca3?.trim().toUpperCase();
    if (!name || !iso2 || !iso3) {
      continue;
    }
    if (isExcludedCountry(iso2) || isExcludedCountry(name)) {
      continue;
    }
    const payload = {
      name,
      iso2,
      iso3,
      phone_code: phoneCodeOf(c),
      latitude: c.latlng?.[0] ?? null,
      longitude: c.latlng?.[1] ?? null,
    };
    await countryRepo.upsert(payload, ['iso2']);
    countryCount += 1;

    const country = await countryRepo.findOneBy({ iso2 });
    if (!country) {
      continue;
    }
    const cities = (citiesByCountry.get(name.toLowerCase()) ?? []).slice(
      0,
      maxCitiesPerCountry,
    );
    for (const cityName of cities) {
      const trimmed = cityName.trim();
      if (trimmed === '') {
        continue;
      }
      await cityRepo.upsert(
        { name: trimmed, country: { id: country.id } as Country },
        ['country', 'name'],
      );
      cityCount += 1;
    }
  }

  return { countries: countryCount, cities: cityCount };
}
