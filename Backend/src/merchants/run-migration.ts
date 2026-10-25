import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';

async function runMigration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get(DataSource);
    const migrations = await dataSource.runMigrations();

    console.log(
      migrations.length
        ? `Executed: ${migrations.map((m) => m.name).join(', ')}`
        : 'No pending migrations.',
    );
  } finally {
    await app.close();
  }
}

runMigration().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
