#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const MigrationManager = require('./migration-manager');

async function run() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 Connected to MongoDB');

    const manager = new MigrationManager();
    const command = process.argv[2];
    const migrationName = process.argv[3];

    switch (command) {
      case 'up':
        await manager.runMigrations('up');
        break;
      
      case 'down':
        await manager.runMigrations('down');
        break;
      
      case 'create':
        if (!migrationName) {
          console.log('❌ Please provide a migration name');
          console.log('Example: npm run migrate:create add-new-field');
          process.exit(1);
        }
        await manager.createMigration(migrationName);
        break;
      
      default:
        // Default to running all pending migrations
        await manager.runMigrations('up');
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
    process.exit(0);
  }
}

run();