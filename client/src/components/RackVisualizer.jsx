import { useState, useRef } from 'react'
import { Trash2, Plus, GripVertical } from 'lucide-react'
import './RackVisualizer.css'

const UNIT_HEIGHT_PX = 40
const DEVICE_TYPE_COLORS = {
  'Server': 'bg-blue-500',
  'Switch': 'bg-green-500',
  'PDU': 'bg-amber-500',
  'Patch Panel': 'bg-purple-500',
  'Storage': 'bg-indigo-500',
  'UPS': 'bg-red-500'
}

function RackVisualizer({ rack, onAddDevice, onDeleteDevice, onUpdateDevice }) {
  const [isAddingDevice, setIsAddingDevice] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'Server',
    height_u: 1,
    start_u: 1
  })
  
  // Drag-and-drop state
  const [draggedDeviceId, setDraggedDeviceId] = useState(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [proposedPosition, setProposedPosition] = useState(null)
  const [dragCollisionWarning, setDragCollisionWarning] = useState(null)
  const rackContainerRef = useRef(null)

  const rackHeightPx = rack.total_u * UNIT_HEIGHT_PX

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'type' ? value : (name === 'start_u' || name === 'height_u' ? parseInt(value) : value)
    }))
  }

  const handleAddDevice = (e) => {
    e.preventDefault()
    onAddDevice(formData)
    setFormData({ name: '', type: 'Server', height_u: 1, start_u: 1 })
    setIsAddingDevice(false)
  }

  // Drag and drop handlers
  const handleDeviceMouseDown = (e, device) => {
    e.preventDefault()
    setDraggedDeviceId(device.id)
    const rect = rackContainerRef.current.getBoundingClientRect()
    const mouseY = rect.bottom - e.clientY // Distance from bottom (inverted)
    const deviceBottomPx = (device.start_u - 1) * UNIT_HEIGHT_PX
    setDragOffset(mouseY - deviceBottomPx)
  }

  const handleMouseMove = (e) => {
    if (!draggedDeviceId || !rackContainerRef.current) return

    const draggedDevice = rack.devices.find(d => d.id === draggedDeviceId)
    if (!draggedDevice) return

    const rect = rackContainerRef.current.getBoundingClientRect()
    const mouseY = rect.bottom - e.clientY // Distance from bottom (inverted)
    const newBottomPx = mouseY - dragOffset
    
    // Convert pixel position to U position (snap to floor for stable snapping)
    let newStartU = Math.floor(newBottomPx / UNIT_HEIGHT_PX) + 1
    newStartU = Math.max(1, Math.min(newStartU, rack.total_u - draggedDevice.height_u + 1))
    
    setProposedPosition(newStartU)

    // Check for collisions with proposed position
    const wouldCollide = rack.devices.some(device => {
      if (device.id === draggedDeviceId) return false
      
      const deviceEnd = device.start_u + device.height_u - 1
      const proposedEnd = newStartU + draggedDevice.height_u - 1
      
      return !(newStartU > deviceEnd || proposedEnd < device.start_u)
    })

    if (wouldCollide) {
      setDragCollisionWarning('Collision detected - drop will be rejected')
    } else {
      setDragCollisionWarning(null)
    }
  }

  const handleMouseUp = (e) => {
    if (!draggedDeviceId || proposedPosition === null) {
      setDraggedDeviceId(null)
      setProposedPosition(null)
      setDragOffset(0)
      setDragCollisionWarning(null)
      return
    }

    const draggedDevice = rack.devices.find(d => d.id === draggedDeviceId)
    if (draggedDevice && draggedDevice.start_u !== proposedPosition && !dragCollisionWarning) {
      onUpdateDevice(draggedDeviceId, { start_u: proposedPosition })
    }

    setDraggedDeviceId(null)
    setProposedPosition(null)
    setDragOffset(0)
    setDragCollisionWarning(null)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{rack.name}</h2>
          <p className="text-gray-600">{rack.total_u}U Rack • {rack.location || 'No location'}</p>
        </div>
        <button
          onClick={() => setIsAddingDevice(!isAddingDevice)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus size={20} />
          Add Device
        </button>
      </div>

      {/* Add Device Form */}
      {isAddingDevice && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <form onSubmit={handleAddDevice} className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Device Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., SERVER-01"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option>Server</option>
                <option>Switch</option>
                <option>PDU</option>
                <option>Patch Panel</option>
                <option>Storage</option>
                <option>UPS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height (U)</label>
              <input
                type="number"
                name="height_u"
                value={formData.height_u}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Unit</label>
              <input
                type="number"
                name="start_u"
                value={formData.start_u}
                onChange={handleInputChange}
                min="1"
                max={rack.total_u}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="col-span-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Device
            </button>
          </form>
        </div>
      )}

      {/* Drag Collision Warning */}
      {dragCollisionWarning && (
        <div className="fixed top-4 right-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded shadow-lg z-50">
          ⚠️ {dragCollisionWarning}
        </div>
      )}

      {/* Rack Container */}
      <div 
        className="flex gap-4"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Unit Numbers (Left) */}
        <div className="flex flex-col-reverse" style={{ width: '50px' }}>
          {Array.from({ length: rack.total_u }, (_, i) => (
            <div
              key={i}
              style={{ height: `${UNIT_HEIGHT_PX}px` }}
              className="flex items-center justify-center text-sm font-semibold text-gray-600 border-l border-gray-300"
            >
              U{i + 1}
            </div>
          ))}
        </div>

        {/* Rack Content */}
        <div
          ref={rackContainerRef}
          className="relative border-2 border-gray-400 bg-gray-50"
          style={{ height: `${rack.total_u * UNIT_HEIGHT_PX}px`, width: '400px' }}
        >
          {/* Grid lines */}
          {Array.from({ length: rack.total_u }, (_, i) => (
            <div
              key={`line-${i}`}
              style={{
                position: 'absolute',
                top: `${(rack.total_u - i - 1) * UNIT_HEIGHT_PX}px`,
                width: '100%',
                height: '1px',
                backgroundColor: '#e5e7eb'
              }}
            />
          ))}

          {/* Devices */}
          {rack.devices.map(device => {
            const isBeingDragged = draggedDeviceId === device.id
            const displayStartU = isBeingDragged && proposedPosition !== null ? proposedPosition : device.start_u
            const bottomPx = (displayStartU - 1) * UNIT_HEIGHT_PX
            const heightPx = device.height_u * UNIT_HEIGHT_PX
            const colorClass = DEVICE_TYPE_COLORS[device.type] || 'bg-gray-500'
            const isDraggingAny = draggedDeviceId !== null

            return (
              <div
                key={device.id}
                className={`absolute left-0 right-0 ${colorClass} text-white p-2 rounded shadow group transition-all cursor-grab active:cursor-grabbing ${
                  isBeingDragged ? 'opacity-60 border-2 border-white' : 'hover:shadow-lg'
                } ${isDraggingAny && !isBeingDragged ? 'opacity-50' : ''}`}
                style={{
                  bottom: `${bottomPx}px`,
                  height: `${heightPx}px`,
                  minHeight: '40px',
                  userSelect: 'none'
                }}
                title={`${device.name} (U${device.start_u}-U${device.start_u + device.height_u - 1})`}
                onMouseDown={(e) => handleDeviceMouseDown(e, device)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-semibold truncate">{device.name}</div>
                    <div className="text-xs opacity-90">{device.type}</div>
                    {device.height_u > 1 && (
                      <div className="text-xs opacity-75 mt-1">U{displayStartU}-U{displayStartU + device.height_u - 1}</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <GripVertical size={16} className="opacity-60" />
                    <button
                      onClick={() => onDeleteDevice(device.id)}
                      className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 p-1 rounded transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {rack.devices.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No devices in this rack yet</p>
      )}
    </div>
  )
}

export default RackVisualizer
