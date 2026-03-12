const fs = require('fs');
const path = require('path');
const Migration = require('../models/Migration');

class MigrationManager {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.batch = null;
  }

  async getNextBatch() {
    const lastMigration = await Migration.findOne().sort({ batch: -1 });
    return lastMigration ? lastMigration.batch + 1 : 1;
  }

  async getExecutedMigrations() {
    const migrations = await Migration.find().sort({ name: 1 });
    return migrations.map(m => m.name);
  }

  getPendingMigrations(allMigrations, executedMigrations) {
    return allMigrations.filter(m => !executedMigrations.includes(m));
  }

  async runMigrations(direction = 'up') {
    try {
      // Get all migration files
      const files = fs.readdirSync(this.migrationsPath)
        .filter(f => f.endsWith('.js'))
        .sort();

      if (direction === 'up') {
        await this.runUpMigrations(files);
      } else if (direction === 'down') {
        await this.runDownMigrations(files);
      }
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }

  async runUpMigrations(files) {
    const executedMigrations = await this.getExecutedMigrations();
    const pendingMigrations = this.getPendingMigrations(files, executedMigrations);
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations to run');
      return;
    }

    this.batch = await this.getNextBatch();
    console.log(`\n📦 Running migrations in batch #${this.batch}`);

    for (const file of pendingMigrations) {
      try {
        console.log(`▶️  Running migration: ${file}`);
        
        const migration = require(path.join(this.migrationsPath, file));
        await migration.up();
        
        await Migration.create({
          name: file,
          batch: this.batch
        });
        
        console.log(`✅ Completed migration: ${file}`);
      } catch (error) {
        console.error(`❌ Failed migration: ${file}`, error);
        throw error;
      }
    }

    console.log(`\n✨ All migrations completed successfully for batch #${this.batch}`);
  }

  async runDownMigrations(files) {
    const executedMigrations = await this.getExecutedMigrations();
    const lastBatch = await Migration.findOne().sort({ batch: -1 });
    
    if (!lastBatch) {
      console.log('No migrations to rollback');
      return;
    }

    const migrationsToRollback = await Migration.find({ batch: lastBatch.batch })
      .sort({ name: -1 });

    console.log(`\n📦 Rolling back batch #${lastBatch.batch}`);

    for (const migration of migrationsToRollback) {
      try {
        console.log(`⬇️  Rolling back: ${migration.name}`);
        
        const migrationModule = require(path.join(this.migrationsPath, migration.name));
        await migrationModule.down();
        
        await Migration.deleteOne({ name: migration.name });
        
        console.log(`✅ Rolled back: ${migration.name}`);
      } catch (error) {
        console.error(`❌ Failed rollback: ${migration.name}`, error);
        throw error;
      }
    }

    console.log(`\n✨ Rollback completed for batch #${lastBatch.batch}`);
  }

  async createMigration(name) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace(/T/g, '-');
    const filename = `${timestamp}-${name}.js`;
    const filepath = path.join(this.migrationsPath, filename);

    const template = `// Migration: ${name}
// Created: ${new Date().toISOString()}

module.exports = {
  async up() {
    console.log('Running up migration: ${name}');
    // Add your migration logic here
  },

  async down() {
    console.log('Running down migration: ${name}');
    // Add your rollback logic here
  }
};
`;

    fs.writeFileSync(filepath, template);
    console.log(`✅ Created migration: ${filename}`);
    return filename;
  }
}

module.exports = MigrationManager;