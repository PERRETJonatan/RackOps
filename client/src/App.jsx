import { useState, useEffect } from 'react'
import axios from 'axios'
import RackVisualizer from './components/RackVisualizer'
import './App.css'

const API_BASE = 'http://localhost:8080/api'

function App() {
  const [racks, setRacks] = useState([])
  const [selectedRackId, setSelectedRackId] = useState(null)
  const [selectedRack, setSelectedRack] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load all racks on mount
  useEffect(() => {
    fetchRacks()
  }, [])

  const fetchRacks = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/racks`)
      setRacks(response.data)
      
      // Get rackId from URL if available
      const params = new URLSearchParams(window.location.search)
      const urlRackId = params.get('rackId')
      
      if (urlRackId && response.data.some(r => r.id === urlRackId)) {
        setSelectedRackId(urlRackId)
      } else if (response.data.length > 0) {
        setSelectedRackId(response.data[0].id)
      }
    } catch (err) {
      setError('Failed to load racks: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update URL when selected rack changes
  useEffect(() => {
    if (selectedRackId) {
      window.history.replaceState({}, '', `?rackId=${selectedRackId}`)
    }
  }, [selectedRackId])

  // Load selected rack details
  useEffect(() => {
    if (selectedRackId) {
      fetchRackDetails(selectedRackId)
    }
  }, [selectedRackId])

  const fetchRackDetails = async (rackId) => {
    try {
      const response = await axios.get(`${API_BASE}/racks/${rackId}`)
      setSelectedRack(response.data)
    } catch (err) {
      setError('Failed to load rack details: ' + err.message)
    }
  }

  const handleAddDevice = async (deviceData) => {
    try {
      await axios.post(`${API_BASE}/devices`, {
        ...deviceData,
        rack_id: selectedRackId
      })
      // Refresh rack details
      await fetchRackDetails(selectedRackId)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add device: ' + err.message)
    }
  }

  const handleUpdateDevice = async (deviceId, updateData) => {
    try {
      await axios.patch(`${API_BASE}/devices/${deviceId}`, updateData)
      // Refresh rack details
      await fetchRackDetails(selectedRackId)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update device: ' + err.message)
    }
  }

  const handleDeleteDevice = async (deviceId) => {
    try {
      await axios.delete(`${API_BASE}/devices/${deviceId}`)
      await fetchRackDetails(selectedRackId)
    } catch (err) {
      setError('Failed to delete device: ' + err.message)
    }
  }

  if (loading) {
    return (<div className="flex justify-center items-center h-screen">
      <p className="text-lg">Loading RackOps...</p>
    </div>)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">🖥️ RackOps</h1>
          <p className="text-gray-600">Data Center Infrastructure Management</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-6">
          {/* Rack List */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Racks</h2>
            <div className="space-y-2">
              {racks.map(rack => (
                <button
                  key={rack.id}
                  onClick={() => setSelectedRackId(rack.id)}
                  className={`w-full text-left p-2 rounded ${
                    selectedRackId === rack.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <div className="font-semibold">{rack.name}</div>
                  <div className="text-sm">{rack.total_u}U • {rack.device_count} devices</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rack Visualizer */}
          {selectedRack && (
            <div className="col-span-3">
              <RackVisualizer 
                rack={selectedRack}
                onAddDevice={handleAddDevice}
                onUpdateDevice={handleUpdateDevice}
                onDeleteDevice={handleDeleteDevice}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
