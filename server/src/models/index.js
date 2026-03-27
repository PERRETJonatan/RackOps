import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../db/init.js'

export class Rack {
  static create(data) {
    return new Promise((resolve, reject) => {
      const id = uuidv4()
      const { name, total_u, depth, location } = data
      const sql = `
        INSERT INTO racks (id, name, total_u, depth, location)
        VALUES (?, ?, ?, ?, ?)
      `
      getDb().run(sql, [id, name, total_u, depth || null, location || null], function(err) {
        if (err) reject(err)
        else resolve({ id, name, total_u, depth, location })
      })
    })
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      getDb().get('SELECT * FROM racks WHERE id = ?', [id], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      getDb().all('SELECT * FROM racks', (err, rows) => {
        if (err) reject(err)
        else resolve(rows || [])
      })
    })
  }
}

export class Device {
  static create(data) {
    return new Promise((resolve, reject) => {
      const id = uuidv4()
      const { rack_id, name, type, height_u, start_u, metadata } = data
      const sql = `
        INSERT INTO devices (id, rack_id, name, type, height_u, start_u, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      const metadataJson = metadata ? JSON.stringify(metadata) : null
      getDb().run(sql, [id, rack_id, name, type, height_u, start_u, metadataJson], function(err) {
        if (err) reject(err)
        else resolve({ id, rack_id, name, type, height_u, start_u, metadata })
      })
    })
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      getDb().get('SELECT * FROM devices WHERE id = ?', [id], (err, row) => {
        if (err) reject(err)
        else {
          if (row && row.metadata) {
            row.metadata = JSON.parse(row.metadata)
          }
          resolve(row)
        }
      })
    })
  }

  static findByRackId(rack_id) {
    return new Promise((resolve, reject) => {
      getDb().all('SELECT * FROM devices WHERE rack_id = ? ORDER BY start_u DESC', [rack_id], (err, rows) => {
        if (err) reject(err)
        else {
          if (rows) {
            rows.forEach(row => {
              if (row.metadata) {
                row.metadata = JSON.parse(row.metadata)
              }
            })
          }
          resolve(rows || [])
        }
      })
    })
  }

  static update(id, data) {
    return new Promise((resolve, reject) => {
      const { name, type, height_u, start_u, metadata } = data
      const sql = `
        UPDATE devices
        SET name = COALESCE(?, name),
            type = COALESCE(?, type),
            height_u = COALESCE(?, height_u),
            start_u = COALESCE(?, start_u),
            metadata = COALESCE(?, metadata),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      const metadataJson = metadata ? JSON.stringify(metadata) : null
      getDb().run(sql, [name, type, height_u, start_u, metadataJson, id], function(err) {
        if (err) reject(err)
        else resolve({ id, name, type, height_u, start_u, metadata })
      })
    })
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      getDb().run('DELETE FROM devices WHERE id = ?', [id], function(err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
