import express from 'express'
import { Device } from '../models/index.js'
import { validateDevicePlacement } from '../middleware/collisionEngine.js'
import { z } from 'zod'

const router = express.Router()

// Validation schemas
const createDeviceSchema = z.object({
  rack_id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['Server', 'Switch', 'PDU', 'Patch Panel', 'Storage', 'UPS']),
  height_u: z.number().int().min(1),
  start_u: z.number().int().min(1),
  power_watts: z.number().int().min(0).optional(),
  weight_kg: z.number().min(0).optional(),
  metadata: z.record(z.any()).optional()
})

const updateDeviceSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['Server', 'Switch', 'PDU', 'Patch Panel', 'Storage', 'UPS']).optional(),
  height_u: z.number().int().min(1).optional(),
  start_u: z.number().int().min(1).optional(),
  power_watts: z.number().int().min(0).optional(),
  weight_kg: z.number().min(0).optional(),
  metadata: z.record(z.any()).optional()
})

// POST /api/devices - Add device to rack (Triggers Collision Engine)
router.post('/', validateDevicePlacement, async (req, res) => {
  try {
    const validData = createDeviceSchema.parse(req.body)
    const device = await Device.create(validData)
    res.status(201).json(device)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    res.status(500).json({ error: error.message })
  }
})

// PATCH /api/devices/:id - Move device or edit metadata (Triggers Collision Engine)
router.patch('/:id', validateDevicePlacement, async (req, res) => {
  try {
    const validData = updateDeviceSchema.parse(req.body)
    const device = await Device.update(req.params.id, validData)
    res.json(device)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/devices/:id - Remove device from rack
router.delete('/:id', async (req, res) => {
  try {
    await Device.delete(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
