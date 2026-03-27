import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RackVisualizer from '../components/RackVisualizer'

describe('RackVisualizer Component', () => {
  const mockRack = {
    id: 'test-rack-1',
    name: 'DC1-ROW4-RACK02',
    total_u: 42,
    location: 'Data Center 1',
    devices: [
      {
        id: 'device-1',
        name: 'SERVER-01',
        type: 'Server',
        height_u: 2,
        start_u: 40
      },
      {
        id: 'device-2',
        name: 'SWITCH-01',
        type: 'Switch',
        height_u: 1,
        start_u: 35
      }
    ]
  }

  it('should render rack name and capacity', () => {
    const mockHandlers = {
      onAddDevice: vi.fn(),
      onUpdateDevice: vi.fn(),
      onDeleteDevice: vi.fn()
    }

    render(
      <RackVisualizer
        rack={mockRack}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('DC1-ROW4-RACK02')).toBeInTheDocument()
    expect(screen.getByText(/42U Rack/)).toBeInTheDocument()
  })

  it('should display all devices', () => {
    const mockHandlers = {
      onAddDevice: vi.fn(),
      onUpdateDevice: vi.fn(),
      onDeleteDevice: vi.fn()
    }

    render(
      <RackVisualizer
        rack={mockRack}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('SERVER-01')).toBeInTheDocument()
    expect(screen.getByText('SWITCH-01')).toBeInTheDocument()
  })

  it('should show Add Device button', () => {
    const mockHandlers = {
      onAddDevice: vi.fn(),
      onUpdateDevice: vi.fn(),
      onDeleteDevice: vi.fn()
    }

    render(
      <RackVisualizer
        rack={mockRack}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Add Device')).toBeInTheDocument()
  })
})
