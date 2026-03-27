import React, { useEffect, useState } from 'react'
import axios from 'axios'

/**
 * PowerHeatmap Component
 * Visualizes power consumption distribution across rack units
 * Uses color intensity to represent power levels
 */
export function PowerHeatmap({ rackId, totalU }) {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!rackId) return

    const fetchHeatmapData = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/api/analytics/racks/${rackId}/heatmap`)
        setDevices(response.data.devices)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.error || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHeatmapData()
  }, [rackId])

  const getColorClass = (powerLevel) => {
    switch (powerLevel) {
      case 'critical':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-400'
      case 'medium':
        return 'bg-yellow-300'
      case 'low':
        return 'bg-green-300'
      default:
        return 'bg-gray-100'
    }
  }

  const getOutlineClass = (powerLevel) => {
    switch (powerLevel) {
      case 'critical':
        return 'border-red-700'
      case 'high':
        return 'border-orange-600'
      case 'medium':
        return 'border-yellow-600'
      case 'low':
        return 'border-green-600'
      default:
        return 'border-gray-300'
    }
  }

  if (!rackId) return null
  if (loading) return <div className="p-4 text-gray-500">Loading heatmap...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="border-b pb-3">
        <h3 className="font-semibold text-lg">Power Density Heatmap</h3>
        <p className="text-sm text-gray-600">Color intensity indicates power consumption per device</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 border border-red-700"></div>
          <span>Critical (&gt;1000W)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 border border-orange-600"></div>
          <span>High (500-1000W)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-300 border border-yellow-600"></div>
          <span>Medium (100-500W)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 border border-green-600"></div>
          <span>Low (&lt;100W)</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-gray-50 p-4 rounded space-y-1 max-h-96 overflow-y-auto">
        {devices && devices.length > 0 ? (
          devices.map(device => (
            <div
              key={device.id}
              className={`${getColorClass(device.powerLevel)} border-l-4 ${getOutlineClass(device.powerLevel)} p-2 rounded flex justify-between items-center hover:shadow-md transition-shadow`}
            >
              <div className="flex-1">
                <div className="font-semibold text-sm">{device.name}</div>
                <div className="text-xs text-gray-700">
                  U{device.start_u}-U{device.start_u + device.height_u - 1} • {device.type}
                </div>
              </div>
              <div className="text-right ml-2">
                <div className="font-semibold text-sm">{device.power_watts}W</div>
                <div className="text-xs text-gray-600">
                  {device.weight_kg}kg
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No devices with power data in this rack
          </div>
        )}
      </div>

      {/* Statistics Footer */}
      {devices && devices.length > 0 && (
        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 flex justify-between">
          <span>Total Devices with Power: {devices.length}</span>
          <span>Total Power: {devices.reduce((sum, d) => sum + d.power_watts, 0)}W</span>
          <span>Total Weight: {(devices.reduce((sum, d) => sum + d.weight_kg, 0)).toFixed(1)}kg</span>
        </div>
      )}
    </div>
  )
}

export default PowerHeatmap
