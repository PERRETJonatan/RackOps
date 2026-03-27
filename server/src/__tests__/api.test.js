import request from 'supertest'
import express from 'express'
import racksRouter from '../routes/racks.js'
import devicesRouter from '../routes/devices.js'
import { initializeDatabase } from '../db/init.js'

// Create a test app
const app = express()
app.use(express.json())
app.use('/racks', racksRouter)
app.use('/devices', devicesRouter)

describe('Racks API', () => {
  beforeAll(async () => {
    await initializeDatabase()
  })

  it('should fetch all racks', async () => {
    const res = await request(app).get('/racks')
    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('should create a new rack', async () => {
    const res = await request(app)
      .post('/racks')
      .send({
        name: 'TEST-RACK-01',
        total_u: 42,
        location: 'Test DataCenter'
      })

    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.name).toBe('TEST-RACK-01')
  })

  it('should reject invalid rack data', async () => {
    const res = await request(app)
      .post('/racks')
      .send({
        name: 'TEST-RACK-02',
        total_u: 0  // Invalid: must be >= 1
      })

    expect(res.statusCode).toEqual(400)
  })
})

describe('Devices API', () => {
  let testRackId

  beforeAll(async () => {
    await initializeDatabase()
    // Create a rack for testing
    const rackRes = await request(app)
      .post('/racks')
      .send({
        name: 'TEST-DEVICE-RACK',
        total_u: 42
      })
    testRackId = rackRes.body.id
  })

  it('should add device to rack', async () => {
    const res = await request(app)
      .post('/devices')
      .send({
        rack_id: testRackId,
        name: 'TEST-SERVER-01',
        type: 'Server',
        height_u: 2,
        start_u: 40
      })

    expect(res.statusCode).toEqual(201)
    expect(res.body.name).toBe('TEST-SERVER-01')
  })

  it('should reject overlapping devices', async () => {
    // First device at U40-U41
    await request(app)
      .post('/devices')
      .send({
        rack_id: testRackId,
        name: 'DEVICE-A',
        type: 'Server',
        height_u: 2,
        start_u: 40
      })

    // Try to add overlapping device at U41-U42
    const res = await request(app)
      .post('/devices')
      .send({
        rack_id: testRackId,
        name: 'DEVICE-B',
        type: 'Server',
        height_u: 2,
        start_u: 41
      })

    expect(res.statusCode).toEqual(400)
    expect(res.body.error).toContain('Collision')
  })
})
