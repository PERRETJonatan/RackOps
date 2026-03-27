import express from 'express'
import { Rack, Device } from '../models/index.js'
import { z } from 'zod'

const router = express.Router()

// Validation schemas
const createRackSchema = z.object({
  name: z.string().min(1),
  total_u: z.number().int().min(1).max(100),
  depth: z.enum(['Full', 'Half']).optional(),
  location: z.string().optional()
})

// GET /api/racks - Returns list of all racks + device counts
router.get('/', async (req, res) => {
  try {
    const racks = await Rack.findAll()
    const racksWithCounts = await Promise.all(
      racks.map(async (rack) => {
        const devices = await Device.findByRackId(rack.id)
        return {
          ...rack,
          device_count: devices.length
        }
      })
    )
    res.json(racksWithCounts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/racks/:id - Returns full rack details and all associated devices
router.get('/:id', async (req, res) => {
  try {
    const rack = await Rack.findById(req.params.id)
    if (!rack) {
      return res.status(404).json({ error: 'Rack not found' })
    }
    const devices = await Device.findByRackId(rack.id)
    res.json({ ...rack, devices })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/racks - Create a new rack
router.post('/', async (req, res) => {
  try {
    const validData = createRackSchema.parse(req.body)
    const rack = await Rack.create(validData)
    res.status(201).json(rack)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    res.status(500).json({ error: error.message })
  }
})

export default router
