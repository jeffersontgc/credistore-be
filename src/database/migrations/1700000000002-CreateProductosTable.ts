import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1700000000002 implements MigrationInterface {
  name = 'CreateProductsTable1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."products_type_enum" AS ENUM('granos_basicos', 'snacks', 'bebidas', 'lacteos')`,
    );

    await queryRunner.query(
      `CREATE TABLE "products" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "price" numeric NOT NULL,
        "stock" integer NOT NULL DEFAULT 0,
        "type" "public"."products_type_enum" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_products_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_products_uuid" ON "products" ("uuid")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_name" ON "products" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_type" ON "products" ("type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_products_type"`);
    await queryRunner.query(`DROP INDEX "IDX_products_name"`);
    await queryRunner.query(`DROP INDEX "IDX_products_uuid"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."products_type_enum"`);
  }
}
