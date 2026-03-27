import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { AlertTriangle, Zap, Scale } from 'lucide-react'

/**
 * PowerConsumption Component
 * Displays power analytics for the selected rack
 */
export function PowerConsumption({ rackId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!rackId) return

    const fetchPowerData = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/api/analytics/racks/${rackId}/power`)
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.error || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPowerData()
  }, [rackId])

  if (!rackId) return null
  if (loading) return <div className="p-4 text-gray-500">Loading power data...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (!data) return null

  const densityColor = data.powerDensityStatus === 'high' ? 'text-red-600' : data.powerDensityStatus === 'medium' ? 'text-yellow-600' : 'text-green-600'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold text-lg">Power Consumption</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-gray-600">Total Power</div>
          <div className="text-2xl font-bold text-blue-700">{data.total_power || 0}W</div>
        </div>

        <div className={`p-3 rounded ${data.powerDensityStatus === 'high' ? 'bg-red-50' : data.powerDensityStatus === 'medium' ? 'bg-yellow-50' : 'bg-green-50'}`}>
          <div className="text-sm text-gray-600">Power Density</div>
          <div className={`text-2xl font-bold ${densityColor}`}>{data.powerDensity}W/U</div>
        </div>

        <div className="bg-purple-50 p-3 rounded">
          <div className="text-sm text-gray-600">Avg Per Device</div>
          <div className="text-2xl font-bold text-purple-700">{Math.round(data.avg_power || 0)}W</div>
        </div>

        <div className="bg-indigo-50 p-3 rounded">
          <div className="text-sm text-gray-600">Peak Device</div>
          <div className="text-2xl font-bold text-indigo-700">{data.max_device_power || 0}W</div>
        </div>
      </div>

      {/* Imbalance Alert */}
      {data.imbalance?.imbalanced && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded flex gap-2 items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-yellow-800">Power Imbalance Detected</div>
            <div className="text-sm text-yellow-700">{data.imbalance.explanation}</div>
          </div>
        </div>
      )}

      {/* Power by Device Type */}
      {data.byDeviceType && data.byDeviceType.length > 0 && (
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-semibold text-sm mb-2">Power by Device Type</div>
          <div className="space-y-1">
            {data.byDeviceType.map(item => (
              <div key={item.type} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.type}</span>
                <span className="font-semibold text-gray-900">{item.total_power}W ({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * WeightDistribution Component
 * Displays weight analytics for the selected rack
 */
export function WeightDistribution({ rackId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!rackId) return

    const fetchWeightData = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/api/analytics/racks/${rackId}/weight`)
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.error || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeightData()
  }, [rackId])

  if (!rackId) return null
  if (loading) return <div className="p-4 text-gray-500">Loading weight data...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (!data) return null

  const densityColor = data.weightDensityStatus === 'high' ? 'text-red-600' : data.weightDensityStatus === 'medium' ? 'text-yellow-600' : 'text-green-600'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <Scale className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-lg">Weight Distribution</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-gray-600">Total Weight</div>
          <div className="text-2xl font-bold text-green-700">{(data.total_weight || 0).toFixed(1)}kg</div>
        </div>

        <div className={`p-3 rounded ${data.weightDensityStatus === 'high' ? 'bg-red-50' : data.weightDensityStatus === 'medium' ? 'bg-yellow-50' : 'bg-green-50'}`}>
          <div className="text-sm text-gray-600">Weight Density</div>
          <div className={`text-2xl font-bold ${densityColor}`}>{data.weightDensity}kg/U</div>
        </div>

        <div className="bg-cyan-50 p-3 rounded">
          <div className="text-sm text-gray-600">Avg Per Device</div>
          <div className="text-2xl font-bold text-cyan-700">{(data.avg_weight || 0).toFixed(1)}kg</div>
        </div>

        <div className="bg-teal-50 p-3 rounded">
          <div className="text-sm text-gray-600">Heaviest Device</div>
          <div className="text-2xl font-bold text-teal-700">{data.max_device_weight || 0}kg</div>
        </div>
      </div>

      {/* Imbalance Alert */}
      {data.imbalance?.imbalanced && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded flex gap-2 items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-yellow-800">Weight Imbalance Detected</div>
            <div className="text-sm text-yellow-700">{data.imbalance.explanation}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default { PowerConsumption, WeightDistribution }
