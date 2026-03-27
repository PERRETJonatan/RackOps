import { getDb } from '../db/init.js'

/**
 * Analytics Model
 * Provides power consumption and weight distribution analysis
 */

export class Analytics {
  /**
   * Get power consumption analysis for a rack
   */
  static getRackPowerAnalytics(rackId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          SUM(power_watts) as total_power,
          AVG(power_watts) as avg_power,
          MAX(power_watts) as max_device_power,
          COUNT(*) as device_count,
          COUNT(CASE WHEN power_watts > 0 THEN 1 END) as devices_with_power
        FROM devices WHERE rack_id = ?
      `
      getDb().get(sql, [rackId], (err, row) => {
        if (err) reject(err)
        else resolve(row || { total_power: 0, avg_power: 0, max_device_power: 0, device_count: 0, devices_with_power: 0 })
      })
    })
  }

  /**
   * Get weight distribution analysis for a rack
   */
  static getRackWeightAnalytics(rackId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          SUM(weight_kg) as total_weight,
          AVG(weight_kg) as avg_weight,
          MAX(weight_kg) as max_device_weight,
          MIN(weight_kg) as min_device_weight,
          COUNT(*) as device_count,
          COUNT(CASE WHEN weight_kg > 0 THEN 1 END) as devices_with_weight
        FROM devices WHERE rack_id = ?
      `
      getDb().get(sql, [rackId], (err, row) => {
        if (err) reject(err)
        else resolve(row || { total_weight: 0, avg_weight: 0, max_device_weight: 0, device_count: 0, devices_with_weight: 0 })
      })
    })
  }

  /**
   * Get power distribution by device type
   */
  static getPowerByDeviceType(rackId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          type,
          COUNT(*) as count,
          SUM(power_watts) as total_power,
          AVG(power_watts) as avg_power
        FROM devices WHERE rack_id = ? AND power_watts > 0
        GROUP BY type
        ORDER BY total_power DESC
      `
      getDb().all(sql, [rackId], (err, rows) => {
        if (err) reject(err)
        else resolve(rows || [])
      })
    })
  }

  /**
   * Detect power distribution imbalance
   * Returns warning if top 20% of devices consume > 80% of power (Pareto anomaly)
   */
  static checkPowerImbalance(rackId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT power_watts FROM devices 
        WHERE rack_id = ? AND power_watts > 0
        ORDER BY power_watts DESC
      `
      getDb().all(sql, [rackId], async (err, devices) => {
        if (err) {
          reject(err)
          return
        }

        if (!devices || devices.length < 2) {
          resolve({ imbalanced: false, explanation: 'Not enough powered devices' })
          return
        }

        const total = devices.reduce((sum, d) => sum + d.power_watts, 0)
        const top20Count = Math.ceil(devices.length * 0.2)
        const top20Power = devices.slice(0, top20Count).reduce((sum, d) => sum + d.power_watts, 0)
        const top20Percent = (top20Power / total) * 100

        const imbalanced = top20Percent > 80

        resolve({
          imbalanced,
          explanation: `Top ${top20Count}% of devices consume ${top20Percent.toFixed(1)}% of power`,
          topDevicesCount: top20Count,
          topDevicesPowerPercent: top20Percent.toFixed(1),
          totalPower: total
        })
      })
    })
  }

  /**
   * Detect weight distribution imbalance
   * Returns warning if top 30% of devices account for > 70% of weight
   */
  static checkWeightImbalance(rackId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT weight_kg FROM devices 
        WHERE rack_id = ? AND weight_kg > 0
        ORDER BY weight_kg DESC
      `
      getDb().all(sql, [rackId], async (err, devices) => {
        if (err) {
          reject(err)
          return
        }

        if (!devices || devices.length < 2) {
          resolve({ imbalanced: false, explanation: 'Not enough weighted devices' })
          return
        }

        const total = devices.reduce((sum, d) => sum + d.weight_kg, 0)
        const heavyCount = Math.ceil(devices.length * 0.3)
        const heavyWeight = devices.slice(0, heavyCount).reduce((sum, d) => sum + d.weight_kg, 0)
        const heavyPercent = (heavyWeight / total) * 100

        const imbalanced = heavyPercent > 70

        resolve({
          imbalanced,
          explanation: `Top ${heavyCount}% of devices account for ${heavyPercent.toFixed(1)}% of weight`,
          topDevicesCount: heavyCount,
          topDevicesWeightPercent: heavyPercent.toFixed(1),
          totalWeight: total.toFixed(2)
        })
      })
    })
  }

  /**
   * Get device-level power and weight details for heatmap
   */
  static getDevicePowerWeightDetails(rackId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          id, name, type, start_u, height_u,
          power_watts, weight_kg
        FROM devices WHERE rack_id = ?
        ORDER BY start_u DESC
      `
      getDb().all(sql, [rackId], (err, rows) => {
        if (err) reject(err)
        else resolve(rows || [])
      })
    })
  }

  /**
   * Get all racks with their power/weight summary
   */
  static getAllRacksAnalytics() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          r.id,
          r.name,
          r.total_u,
          COUNT(d.id) as device_count,
          SUM(d.power_watts) as total_power,
          SUM(d.weight_kg) as total_weight,
          MAX(d.power_watts) as peak_device_power,
          MAX(d.weight_kg) as peak_device_weight
        FROM racks r
        LEFT JOIN devices d ON r.id = d.rack_id
        GROUP BY r.id, r.name, r.total_u
        ORDER BY r.name
      `
      getDb().all(sql, [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows || [])
      })
    })
  }

  /**
   * Calculate power density (watts per U)
   */
  static calculatePowerDensity(rackId, totalU, totalPower) {
    return totalU > 0 ? (totalPower / totalU).toFixed(2) : 0
  }

  /**
   * Calculate weight density (kg per U)
   */
  static calculateWeightDensity(rackId, totalU, totalWeight) {
    return totalU > 0 ? (totalWeight / totalU).toFixed(2) : 0
  }
}
