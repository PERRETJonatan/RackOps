import axios from 'axios'
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = join(__dirname, 'data/rackops.db')

const API_BASE = 'http://localhost:8080/api'

// Connect to database
const db = new sqlite3.Database(dbPath)

const sampleRacks = [
  {
    name: 'DC1-ROW4-RACK02',
    total_u: 42,
    location: 'Data Center 1, Row 4'
  },
  {
    name: 'DC1-ROW4-RACK03',
    total_u: 42,
    location: 'Data Center 1, Row 4'
  },
  {
    name: 'DC2-ROW1-RACK01',
    total_u: 24,
    location: 'Data Center 2, Row 1'
  }
]

const sampleDevices = [
  // DC1-ROW4-RACK02 devices
  {
    rackIndex: 0,
    devices: [
      { name: 'SERVER-01', type: 'Server', height_u: 2, start_u: 40, power_watts: 850, weight_kg: 12, metadata: { ip: '192.168.1.10' } },
      { name: 'SERVER-02', type: 'Server', height_u: 2, start_u: 37, power_watts: 920, weight_kg: 12, metadata: { ip: '192.168.1.11' } },
      { name: 'SWITCH-01', type: 'Switch', height_u: 1, start_u: 35, power_watts: 450, weight_kg: 8, metadata: { ip: '192.168.1.1', ports: 48 } },
      { name: 'PDU-01', type: 'PDU', height_u: 3, start_u: 31, power_watts: 50, weight_kg: 6, metadata: { circuits: 24 } },
      { name: 'STORAGE-01', type: 'Storage', height_u: 4, start_u: 26, power_watts: 1200, weight_kg: 40, metadata: { capacity: '100TB' } },
      { name: 'UPS-01', type: 'UPS', height_u: 5, start_u: 20, power_watts: 150, weight_kg: 80, metadata: { capacity: '20kVA' } },
      { name: 'PATCH-01', type: 'Patch Panel', height_u: 2, start_u: 17, power_watts: 10, weight_kg: 4, metadata: { ports: 96 } },
    ]
  },
  // DC1-ROW4-RACK03 devices
  {
    rackIndex: 1,
    devices: [
      { name: 'SERVER-03', type: 'Server', height_u: 1, start_u: 41, power_watts: 680, weight_kg: 8, metadata: { ip: '192.168.1.20' } },
      { name: 'SERVER-04', type: 'Server', height_u: 2, start_u: 38, power_watts: 950, weight_kg: 12, metadata: { ip: '192.168.1.21' } },
      { name: 'SWITCH-02', type: 'Switch', height_u: 1, start_u: 36, power_watts: 420, weight_kg: 7, metadata: { ip: '192.168.1.2', ports: 48 } },
      { name: 'STORAGE-02', type: 'Storage', height_u: 3, start_u: 32, power_watts: 800, weight_kg: 25, metadata: { capacity: '60TB' } },
    ]
  },
  // DC2-ROW1-RACK01 devices
  {
    rackIndex: 2,
    devices: [
      { name: 'SERVER-05', type: 'Server', height_u: 2, start_u: 22, power_watts: 750, weight_kg: 10, metadata: { ip: '10.0.1.10' } },
      { name: 'SWITCH-03', type: 'Switch', height_u: 1, start_u: 20, power_watts: 280, weight_kg: 5, metadata: { ip: '10.0.1.1', ports: 24 } },
      { name: 'PDU-02', type: 'PDU', height_u: 2, start_u: 17, power_watts: 40, weight_kg: 4, metadata: { circuits: 12 } },
    ]
  }
]

/**
 * Clear all existing data from database
 */
const clearDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Delete all devices first (foreign key constraint)
      db.run('DELETE FROM devices', (err) => {
        if (err) reject(err)
      })
      
      // Delete all racks
      db.run('DELETE FROM racks', (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  })
}

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n')
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await clearDatabase()
    console.log('✓ Database cleared\n')

    // Create racks
    const createdRacks = []
    for (const rack of sampleRacks) {
      console.log(`Creating rack: ${rack.name}...`)
      const response = await axios.post(`${API_BASE}/racks`, rack)
      createdRacks.push(response.data)
      console.log(`✓ Created ${rack.name} (ID: ${response.data.id})\n`)
    }

    // Add devices to racks
    for (const { rackIndex, devices } of sampleDevices) {
      const rackId = createdRacks[rackIndex].id
      const rackName = createdRacks[rackIndex].name
      console.log(`Adding devices to ${rackName}...`)

      for (const device of devices) {
        try {
          const response = await axios.post(`${API_BASE}/devices`, {
            ...device,
            rack_id: rackId
          })
          console.log(`  ✓ Added ${device.name} (U${device.start_u}-U${device.start_u + device.height_u - 1})`)
        } catch (error) {
          console.error(`  ✗ Failed to add ${device.name}: ${error.response?.data?.error || error.message}`)
        }
      }
      console.log()
    }

    console.log('✅ Database seeding complete!')
    console.log('\n📊 Summary:')
    console.log(`   - ${createdRacks.length} racks created`)
    console.log(`   - ${sampleDevices.reduce((sum, d) => sum + d.devices.length, 0)} devices added`)
    console.log('\n🚀 Ready to test drag-and-drop and other features!')

    db.close()
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error.response?.data || error.message)
    db.close()
    process.exit(1)
  }
}

seedDatabase()
