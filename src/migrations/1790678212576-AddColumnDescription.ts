import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnDescription1790678212576 implements MigrationInterface {
    name = 'AddColumnDescription1790678212576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "description"`);
    }

}
