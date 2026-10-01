import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategory1790676467638 implements MigrationInterface {
  name = 'CreateCategory1790676467638';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" SERIAL NOT NULL, "title" character varying(20) NOT NULL, "slug" character varying(30) NOT NULL, "image" character varying, "is_show" boolean NOT NULL DEFAULT true, "parent_id" integer, CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"), CONSTRAINT "PK_categories" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_parent"`,
    );
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
