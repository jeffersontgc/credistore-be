import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDebtsItemsTable1700000000004 implements MigrationInterface {
  name = 'CreateDebtsItemsTable1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "debts_items" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL,
        "debtId" integer NOT NULL,
        "productId" integer NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "price" numeric NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_debts_items_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_debts_items_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_debts_items_uuid" ON "debts_items" ("uuid")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_debts_items_debtId" ON "debts_items" ("debtId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_debts_items_productId" ON "debts_items" ("productId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "debts_items" ADD CONSTRAINT "FK_debts_items_debtId" FOREIGN KEY ("debtId") REFERENCES "debts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "debts_items" ADD CONSTRAINT "FK_debts_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "debts_items" DROP CONSTRAINT "FK_debts_items_productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "debts_items" DROP CONSTRAINT "FK_debts_items_debtId"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_debts_items_productId"`);
    await queryRunner.query(`DROP INDEX "IDX_debts_items_debtId"`);
    await queryRunner.query(`DROP INDEX "IDX_debts_items_uuid"`);
    await queryRunner.query(`DROP TABLE "debts_items"`);
  }
}
