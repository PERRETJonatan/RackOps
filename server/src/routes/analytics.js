import express from 'express'
import { Device, Rack } from '../models/index.js'
import { Analytics } from '../models/analytics.js'

const router = express.Router()

/**
 * GET /api/analytics/racks/:id/power
 * Get power consumption analysis for a specific rack
 */
router.get('/racks/:id/power', async (req, res) => {
  try {
    const rack = await Rack.findById(req.params.id)
    if (!rack) {
      return res.status(404).json({ error: 'Rack not found' })
    }

    const powerAnalytics = await Analytics.getRackPowerAnalytics(req.params.id)
    const powerDensity = Analytics.calculatePowerDensity(req.params.id, rack.total_u, powerAnalytics.total_power || 0)
    const powerImbalance = await Analytics.checkPowerImbalance(req.params.id)
    const powerByType = await Analytics.getPowerByDeviceType(req.params.id)

    res.json({
      rackId: req.params.id,
      rackName: rack.name,
      totalU: rack.total_u,
      ...powerAnalytics,
      powerDensity,
      powerDensityStatus: powerDensity > 50 ? 'high' : powerDensity > 25 ? 'medium' : 'low',
      imbalance: powerImbalance,
      byDeviceType: powerByType
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/analytics/racks/:id/weight
 * Get weight distribution analysis for a specific rack
 */
router.get('/racks/:id/weight', async (req, res) => {
  try {
    const rack = await Rack.findById(req.params.id)
    if (!rack) {
      return res.status(404).json({ error: 'Rack not found' })
    }

    const weightAnalytics = await Analytics.getRackWeightAnalytics(req.params.id)
    const weightDensity = Analytics.calculateWeightDensity(req.params.id, rack.total_u, weightAnalytics.total_weight || 0)
    const weightImbalance = await Analytics.checkWeightImbalance(req.params.id)

    res.json({
      rackId: req.params.id,
      rackName: rack.name,
      totalU: rack.total_u,
      ...weightAnalytics,
      weightDensity,
      weightDensityStatus: weightDensity > 150 ? 'high' : weightDensity > 75 ? 'medium' : 'low',
      imbalance: weightImbalance
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/analytics/racks/:id/heatmap
 * Get device-level power/weight data for heatmap visualization
 */
router.get('/racks/:id/heatmap', async (req, res) => {
  try {
    const rack = await Rack.findById(req.params.id)
    if (!rack) {
      return res.status(404).json({ error: 'Rack not found' })
    }

    const devices = await Analytics.getDevicePowerWeightDetails(req.params.id)
    const powerAnalytics = await Analytics.getRackPowerAnalytics(req.params.id)
    const maxPower = powerAnalytics.max_device_power || 1

    // Add normalized power/weight for visualization (0-100 scale)
    const enrichedDevices = devices.map(d => ({
      ...d,
      powerNormalized: Math.round((d.power_watts / maxPower) * 100),
      powerLevel: d.power_watts > 1000 ? 'critical' : d.power_watts > 500 ? 'high' : d.power_watts > 100 ? 'medium' : 'low'
    }))

    res.json({
      rackId: req.params.id,
      rackName: rack.name,
      totalU: rack.total_u,
      totalPower: powerAnalytics.total_power,
      maxDevicePower: maxPower,
      devices: enrichedDevices
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/analytics/all
 * Get summary analytics for all racks
 */
router.get('/all', async (req, res) => {
  try {
    const racks = await Analytics.getAllRacksAnalytics()
    
    const enriched = racks.map(r => ({
      ...r,
      powerDensity: Analytics.calculatePowerDensity(r.id, r.total_u, r.total_power || 0),
      weightDensity: Analytics.calculateWeightDensity(r.id, r.total_u, r.total_weight || 0),
      powerDensityStatus: Analytics.calculatePowerDensity(r.id, r.total_u, r.total_power || 0) > 50 ? 'high' : 'normal',
      utilizationPercent: ((r.device_count / (r.total_u / 1)) * 100).toFixed(1)
    }))

    res.json({
      timestamp: new Date().toISOString(),
      rackCount: enriched.length,
      racks: enriched
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
