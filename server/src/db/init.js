import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, '../../data/rackops.db')

// Ensure data directory exists
const dataDir = join(__dirname, '../../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new sqlite3.Database(dbPath)

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON')

export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create Racks table
      db.run(`
        CREATE TABLE IF NOT EXISTS racks (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          total_u INTEGER NOT NULL CHECK(total_u >= 1 AND total_u <= 100),
          depth TEXT CHECK(depth IN ('Full', 'Half')),
          location TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create Devices table
      db.run(`
        CREATE TABLE IF NOT EXISTS devices (
          id TEXT PRIMARY KEY,
          rack_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT CHECK(type IN ('Server', 'Switch', 'PDU', 'Patch Panel', 'Storage', 'UPS')),
          height_u INTEGER NOT NULL,
          start_u INTEGER NOT NULL,
          power_watts INTEGER DEFAULT 0 CHECK(power_watts >= 0),
          weight_kg REAL DEFAULT 0 CHECK(weight_kg >= 0),
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (rack_id) REFERENCES racks(id) ON DELETE CASCADE
        )
      `)

      // Create indexes
      db.run('CREATE INDEX IF NOT EXISTS idx_devices_rack_id ON devices(rack_id)')

      db.run('SELECT 1', (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  })
}

export const getDb = () => db
