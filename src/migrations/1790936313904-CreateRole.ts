import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRole1790936313904 implements MigrationInterface {
  name = 'CreateRole1790936313904';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_4f8a9c2d1e6b47a8b3c5d7e9f0a" UNIQUE ("name"), CONSTRAINT "PK_c36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "role_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_7c8d9e0f1a2b43c5a6d7e8f9a0b" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_7c8d9e0f1a2b43c5a6d7e8f9a0b"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_id"`);
    await queryRunner.query(`DROP TABLE "role"`);
  }
}
