import axios from 'axios'

const API_BASE = 'http://localhost:8080/api'

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
      { name: 'SERVER-01', type: 'Server', height_u: 2, start_u: 40, metadata: { ip: '192.168.1.10', power: 500 } },
      { name: 'SERVER-02', type: 'Server', height_u: 2, start_u: 37, metadata: { ip: '192.168.1.11', power: 500 } },
      { name: 'SWITCH-01', type: 'Switch', height_u: 1, start_u: 35, metadata: { ip: '192.168.1.1', ports: 48 } },
      { name: 'PDU-01', type: 'PDU', height_u: 3, start_u: 31, metadata: { circuits: 24 } },
      { name: 'STORAGE-01', type: 'Storage', height_u: 4, start_u: 26, metadata: { capacity: '100TB' } },
      { name: 'UPS-01', type: 'UPS', height_u: 5, start_u: 20, metadata: { capacity: '20kVA' } },
      { name: 'PATCH-01', type: 'Patch Panel', height_u: 2, start_u: 17, metadata: { ports: 96 } },
    ]
  },
  // DC1-ROW4-RACK03 devices
  {
    rackIndex: 1,
    devices: [
      { name: 'SERVER-03', type: 'Server', height_u: 1, start_u: 41, metadata: { ip: '192.168.1.20', power: 300 } },
      { name: 'SERVER-04', type: 'Server', height_u: 2, start_u: 38, metadata: { ip: '192.168.1.21', power: 600 } },
      { name: 'SWITCH-02', type: 'Switch', height_u: 1, start_u: 36, metadata: { ip: '192.168.1.2', ports: 48 } },
      { name: 'STORAGE-02', type: 'Storage', height_u: 3, start_u: 32, metadata: { capacity: '60TB' } },
    ]
  },
  // DC2-ROW1-RACK01 devices
  {
    rackIndex: 2,
    devices: [
      { name: 'SERVER-05', type: 'Server', height_u: 2, start_u: 22, metadata: { ip: '10.0.1.10', power: 450 } },
      { name: 'SWITCH-03', type: 'Switch', height_u: 1, start_u: 20, metadata: { ip: '10.0.1.1', ports: 24 } },
      { name: 'PDU-02', type: 'PDU', height_u: 2, start_u: 17, metadata: { circuits: 12 } },
    ]
  }
]

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n')

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

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error.response?.data || error.message)
    process.exit(1)
  }
}

seedDatabase()
