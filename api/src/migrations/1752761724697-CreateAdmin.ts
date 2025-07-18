import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAdmin1752761724697 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      //   await queryRunner.query(`
      //     insert
      //     into "personal-user" (id, created_at, updated_at, version, login, hash)
      //     values ('ADMIN', current_timestamp, current_timestamp, 1, 'ADMIN', '65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5')`
      //   );
      //
      //   await queryRunner.query(`
      //      insert
      //      into "personal-group" (id, created_at, updated_at, version)
      //      values ('ADMIN', current_timestamp, current_timestamp, 1)`
      //   );
      //
      //   await queryRunner.query(`
      //     insert
      //     into "personal-user2group" ("parentId", "groupId")
      //     values ('ADMIN', 'ADMIN')`
      //   );
      //
      // await queryRunner.query(`
      //   insert
      //   into "personal-access" (created_at, updated_at, version, target, method, "groupId")
      //   values (current_timestamp, current_timestamp, 1, 'ALL',  'ALL', 'ADMIN');`
      // );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
