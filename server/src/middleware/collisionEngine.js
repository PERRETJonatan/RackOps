import { Device, Rack } from '../models/index.js'

/**
 * Collision Engine
 * Validates that a new device placement doesn't overlap with existing devices
 * in the rack and fits within the rack boundaries
 */

/**
 * Check if two device ranges overlap
 * Range A: [S_a, E_a] where E_a = S_a + H_a - 1
 * Range B: [S_b, E_b] where E_b = S_b + H_b - 1
 * Overlap condition: (S_a <= E_b) AND (S_b <= E_a)
 */
function rangesOverlap(startA, heightA, startB, heightB) {
  const endA = startA + heightA - 1
  const endB = startB + heightB - 1
  return startA <= endB && startB <= endA
}

/**
 * Validate that a device fits within the rack boundary
 * Rule A: start_u + (height_u - 1) <= rack.total_u
 * Also: start_u >= 1
 */
function checkBoundary(startU, heightU, rackTotalU) {
  if (startU < 1) {
    return { valid: false, error: 'Start unit must be >= 1' }
  }
  const endU = startU + heightU - 1
  if (endU > rackTotalU) {
    return { valid: false, error: `Device exceeds rack capacity. End unit ${endU} > ${rackTotalU}` }
  }
  return { valid: true }
}

/**
 * Check for overlaps with existing devices in the rack
 */
async function checkOverlaps(rackId, startU, heightU, excludeDeviceId = null) {
  const existingDevices = await Device.findByRackId(rackId)
  
  for (const device of existingDevices) {
    // Skip the device we're updating (when editing)
    if (excludeDeviceId && device.id === excludeDeviceId) continue
    
    if (rangesOverlap(startU, heightU, device.start_u, device.height_u)) {
      return {
        valid: false,
        error: `Collision detected with device "${device.name}" at U${device.start_u}-U${device.start_u + device.height_u - 1}`
      }
    }
  }
  
  return { valid: true }
}

/**
 * Main collision detection middleware
 * Validates a device placement before creation or update
 */
export async function validateDevicePlacement(req, res, next) {
  try {
    let { rack_id, start_u, height_u } = req.body
    const deviceId = req.params.id // For PATCH requests

    // For PATCH requests, fetch the device to get rack_id if not provided
    if (deviceId && !rack_id) {
      const device = await Device.findById(deviceId)
      if (!device) {
        return res.status(404).json({ error: 'Device not found' })
      }
      rack_id = device.rack_id
      // If updating, use existing height if not provided
      if (!height_u) height_u = device.height_u
      if (!start_u) start_u = device.start_u
    }

    if (!rack_id) {
      return res.status(400).json({ error: 'Rack ID is required' })
    }

    // Get the rack
    const rack = await Rack.findById(rack_id)
    if (!rack) {
      return res.status(404).json({ error: 'Rack not found' })
    }

    // Check boundary
    const boundaryCheck = checkBoundary(start_u, height_u, rack.total_u)
    if (!boundaryCheck.valid) {
      return res.status(400).json({ error: boundaryCheck.error })
    }

    // Check overlaps
    const overlapCheck = await checkOverlaps(rack_id, start_u, height_u, deviceId)
    if (!overlapCheck.valid) {
      return res.status(400).json({ error: overlapCheck.error })
    }

    next()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export { checkBoundary, checkOverlaps, rangesOverlap }
