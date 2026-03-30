import { Pool } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres'
});

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔧 Setting up database...');
    
    // Create the database if it doesn't exist
    const dbName = process.env.DB_NAME || 'admission';
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Database '${dbName}' created successfully!`);
  } catch (error) {
    if (error.code === '42P04') {
      console.log('ℹ️  Database already exists, skipping creation');
    } else {
      console.error('❌ Error creating database:', error.message);
      await client.end();
      await pool.end();
      return;
    }
  } finally {
    await client.end();
    await pool.end();
  }

  // Now connect to the new database and create tables
  const appPool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME || 'admission'
  });

  const appClient = await appPool.connect();
  try {
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    await appClient.query(schema);
    console.log('✅ Tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await appClient.end();
    await appPool.end();
  }
}

setupDatabase();