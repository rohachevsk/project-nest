import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGeoAndUserAddress1791000000000
  implements MigrationInterface
{
  name = 'CreateGeoAndUserAddress1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "countries" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "iso2" character varying(2) NOT NULL, "iso3" character varying(3) NOT NULL, "phone_code" character varying, "latitude" float, "longitude" float, CONSTRAINT "UQ_countries_name" UNIQUE ("name"), CONSTRAINT "UQ_countries_iso2" UNIQUE ("iso2"), CONSTRAINT "UQ_countries_iso3" UNIQUE ("iso3"), CONSTRAINT "PK_countries" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cities" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "country_id" integer NOT NULL, "region" character varying, "latitude" float, "longitude" float, CONSTRAINT "PK_cities" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cities" ADD CONSTRAINT "FK_cities_country" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cities" ADD CONSTRAINT "UQ_cities_country_name" UNIQUE ("country_id", "name")`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "country_id" integer`);
    await queryRunner.query(`ALTER TABLE "users" ADD "city_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "street" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "postal_code" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_country" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_city" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_city"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_country"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "postal_code"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "street"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country_id"`);
    await queryRunner.query(`DROP TABLE "cities"`);
    await queryRunner.query(`DROP TABLE "countries"`);
  }
}
