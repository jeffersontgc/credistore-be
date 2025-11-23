import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDebtsTable1700000000003 implements MigrationInterface {
  name = 'CreateDebtsTable1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."debts_status_enum" AS ENUM('active', 'pending', 'paid', 'settled')`,
    );

    await queryRunner.query(
      `CREATE TABLE "debts" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL,
        "userId" integer NOT NULL,
        "date_pay" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" "public"."debts_status_enum" NOT NULL DEFAULT 'active',
        "amount" numeric NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_debts_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_debts_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_debts_uuid" ON "debts" ("uuid")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_debts_userId" ON "debts" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_debts_status" ON "debts" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_debts_date_pay" ON "debts" ("date_pay")`,
    );

    await queryRunner.query(
      `ALTER TABLE "debts" ADD CONSTRAINT "FK_debts_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "debts" DROP CONSTRAINT "FK_debts_userId"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_debts_date_pay"`);
    await queryRunner.query(`DROP INDEX "IDX_debts_status"`);
    await queryRunner.query(`DROP INDEX "IDX_debts_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_debts_uuid"`);
    await queryRunner.query(`DROP TABLE "debts"`);
    await queryRunner.query(`DROP TYPE "public"."debts_status_enum"`);
  }
}
