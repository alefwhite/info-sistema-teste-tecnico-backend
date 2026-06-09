import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1717888888888 implements MigrationInterface {
  name = 'InitialSchema1717888888888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        nickname VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE brands (
        id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        created_by UNIQUEIDENTIFIER NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE models (
        id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        brand_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES brands(id) ON DELETE NO ACTION,
        created_by UNIQUEIDENTIFIER NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT UQ_models_name_brand UNIQUE (name, brand_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE vehicles (
        id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        license_plate VARCHAR(20) NOT NULL UNIQUE,
        chassis VARCHAR(50) NOT NULL UNIQUE,
        renavam VARCHAR(30) NOT NULL UNIQUE,
        year INT NOT NULL,
        model_id UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES models(id) ON DELETE NO ACTION,
        created_by UNIQUEIDENTIFIER NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_vehicle_plate ON vehicles(license_plate)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_vehicle_chassis ON vehicles(chassis)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_vehicle_renavam ON vehicles(renavam)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_vehicle_renavam ON vehicles`);
    await queryRunner.query(`DROP INDEX idx_vehicle_chassis ON vehicles`);
    await queryRunner.query(`DROP INDEX idx_vehicle_plate ON vehicles`);
    await queryRunner.query(`DROP TABLE vehicles`);
    await queryRunner.query(`DROP TABLE models`);
    await queryRunner.query(`DROP TABLE brands`);
    await queryRunner.query(`DROP TABLE users`);
  }
}
