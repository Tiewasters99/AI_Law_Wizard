import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useMiniverseStore } from '@/app/stores/miniverseStore'

interface DraggableItem {
  id: string
  type: 'object' | 'panel'
  position: { x: number; y: number; z: number }
  size?: [number, number, number]
  label: string
  color: string
  visible: boolean
  category: 'room' | 'wall'
}

export const FloorPlanView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [showSwitchDialog, setShowSwitchDialog] = useState(false)

  const { config, updateObject, updatePanel, setViewMode } = useMiniverseStore()

  // Convert 3D coordinates to 2D canvas coordinates
  const worldToCanvas = useCallback((x: number, z: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const centerX = canvas.width / 2 + pan.x
    const centerY = canvas.height / 2 + pan.y
    
    return {
      x: centerX + (x * zoom * 8),
      y: centerY + (z * zoom * 8)
    }
  }, [pan, zoom])

  // Convert canvas coordinates to 3D world coordinates
  const canvasToWorld = useCallback((canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, z: 0 }
    
    const centerX = canvas.width / 2 + pan.x
    const centerY = canvas.height / 2 + pan.y
    
    return {
      x: (canvasX - centerX) / (zoom * 8),
      z: (canvasY - centerY) / (zoom * 8)
    }
  }, [pan, zoom])

  // Check if position is within room boundaries
  const isWithinRoomBounds = useCallback((x: number, z: number) => {
    const roomSize = 25 // Half of the 50x50 room
    return x >= -roomSize && x <= roomSize && z >= -roomSize && z <= roomSize
  }, [])

  // Check if panel position is on walls (not inside room)
  const isOnWall = useCallback((x: number, z: number) => {
    const roomSize = 25 // Half of the 50x50 room
    const wallThickness = 0.5 // Wall thickness
    
    // Check if position is on any of the four walls
    const onBackWall = z <= -roomSize + wallThickness && z >= -roomSize - wallThickness && x >= -roomSize && x <= roomSize
    const onFrontWall = z >= roomSize - wallThickness && z <= roomSize + wallThickness && x >= -roomSize && x <= roomSize
    const onLeftWall = x <= -roomSize + wallThickness && x >= -roomSize - wallThickness && z >= -roomSize && z <= roomSize
    const onRightWall = x >= roomSize - wallThickness && x <= roomSize + wallThickness && z >= -roomSize && z <= roomSize
    
    return onBackWall || onFrontWall || onLeftWall || onRightWall
  }, [])

  // Get all draggable items from config, categorized by type
  const getDraggableItems = useCallback((): DraggableItem[] => {
    const items: DraggableItem[] = []

    // Add room objects (furniture, decorations)
    Object.entries(config.objects).forEach(([type, objects]) => {
      if (Array.isArray(objects)) {
        objects.forEach((obj) => {
          items.push({
            id: obj.id,
            type: 'object',
            position: obj.position,
            label: `${type.slice(0, -1)} ${obj.id.split('-')[1]}`,
            color: obj.color || '#1f2937',
            visible: obj.visible,
            category: 'room' // Room objects
          })
        })
      } else {
        items.push({
          id: objects.id,
          type: 'object',
          position: objects.position,
          label: type,
          color: objects.color || '#1f2937',
          visible: objects.visible,
          category: 'room' // Room objects
        })
      }
    })

    // Add wall panels (interactive elements on walls)
    Object.entries(config.panels).forEach(([panelId, panel]) => {
      items.push({
        id: panelId,
        type: 'panel',
        position: panel.position,
        size: panel.size,
        label: panel.label,
        color: panel.color,
        visible: panel.visible,
        category: 'wall' // Wall panels
      })
    })

    return items
  }, [config])

  // Draw the floor plan
  const drawFloorPlan = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Failed to get 2D context from canvas')
      return
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set background
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#2d3748'
    ctx.lineWidth = 1
    const gridSize = 40 * zoom
    const startX = (pan.x % gridSize)
    const startY = (pan.y % gridSize)

    for (let x = startX; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = startY; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw room boundaries with floor
    const roomSize = 50
    const roomPos = worldToCanvas(-roomSize/2, -roomSize/2)
    const roomSizeCanvas = roomSize * zoom * 8

    // Draw floor
    ctx.fillStyle = '#2d3748'
    ctx.fillRect(roomPos.x, roomPos.y, roomSizeCanvas, roomSizeCanvas)
    
    // Draw room boundaries
    ctx.strokeStyle = '#4a5568'
    ctx.lineWidth = 2
    ctx.strokeRect(roomPos.x, roomPos.y, roomSizeCanvas, roomSizeCanvas)

    // Draw room boundary indicators (corners)
    const cornerSize = 6
    ctx.fillStyle = '#68d391'
    ctx.fillRect(roomPos.x - cornerSize/2, roomPos.y - cornerSize/2, cornerSize, cornerSize)
    ctx.fillRect(roomPos.x + roomSizeCanvas - cornerSize/2, roomPos.y - cornerSize/2, cornerSize, cornerSize)
    ctx.fillRect(roomPos.x - cornerSize/2, roomPos.y + roomSizeCanvas - cornerSize/2, cornerSize, cornerSize)
    ctx.fillRect(roomPos.x + roomSizeCanvas - cornerSize/2, roomPos.y + roomSizeCanvas - cornerSize/2, cornerSize, cornerSize)

    // Draw center point
    const center = worldToCanvas(0, 0)
    ctx.fillStyle = '#68d391'
    ctx.beginPath()
    ctx.arc(center.x, center.y, 3, 0, Math.PI * 2)
    ctx.fill()

    // Draw draggable items, categorized by type
    const items = getDraggableItems()
    
    // Draw room objects first
    items.filter(item => item.category === 'room').forEach((item) => {
      if (!item.visible) return

      const pos = worldToCanvas(item.position.x, item.position.z)
      
      // Check if object is within room bounds
      const isInBounds = isWithinRoomBounds(item.position.x, item.position.z)
      
      // Draw item
      ctx.fillStyle = isInBounds ? item.color : '#ff6b6b' // Red if outside bounds
      ctx.strokeStyle = draggedItem?.id === item.id ? '#68d391' : (isInBounds ? '#4a5568' : '#ff4444')
      ctx.lineWidth = draggedItem?.id === item.id ? 3 : 1

      const radius = 8 * zoom
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Draw label
      if (zoom > 0.5) {
        ctx.fillStyle = isInBounds ? '#ffffff' : '#ff6b6b'
        ctx.font = `${10 * zoom}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(item.label, pos.x, pos.y - radius - 5)
      }
    })

    // Draw wall panels
    items.filter(item => item.category === 'wall').forEach((item) => {
      if (!item.visible) return

      const pos = worldToCanvas(item.position.x, item.position.z)
      
      // Check if panel is on wall
      const isOnWallPosition = isOnWall(item.position.x, item.position.z)
      
      // Draw panel as rectangle
      ctx.fillStyle = isOnWallPosition ? item.color : '#ff6b6b' // Red if not on wall
      ctx.strokeStyle = draggedItem?.id === item.id ? '#68d391' : (isOnWallPosition ? '#4a5568' : '#ff4444')
      ctx.lineWidth = draggedItem?.id === item.id ? 3 : 1

      if (item.size) {
        const width = item.size[0] * zoom * 8
        const height = item.size[2] * zoom * 8
        ctx.fillRect(pos.x - width/2, pos.y - height/2, width, height)
        ctx.strokeRect(pos.x - width/2, pos.y - height/2, width, height)

        // Draw label
        if (zoom > 0.5) {
          ctx.fillStyle = isOnWallPosition ? '#ffffff' : '#ff6b6b'
          ctx.font = `${10 * zoom}px Arial`
          ctx.textAlign = 'center'
          ctx.fillText(item.label, pos.x, pos.y - height/2 - 5)
        }
      }
    })
  }, [worldToCanvas, getDraggableItems, draggedItem, zoom, pan])

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const worldPos = canvasToWorld(x, y)
    const items = getDraggableItems()

    // Find clicked item
    const clickedItem = items.find((item) => {
      if (!item.visible) return false
      
      const itemPos = worldToCanvas(item.position.x, item.position.z)
      const distance = Math.sqrt(
        Math.pow(x - itemPos.x, 2) + Math.pow(y - itemPos.y, 2)
      )
      
      const radius = item.type === 'panel' ? 20 : 15
      return distance < radius * zoom
    })

    if (clickedItem) {
      setDraggedItem(clickedItem)
      setDragOffset({
        x: x - worldToCanvas(clickedItem.position.x, clickedItem.position.z).x,
        y: y - worldToCanvas(clickedItem.position.x, clickedItem.position.z).y
      })
      setIsDragging(true)
    }
  }, [canvasToWorld, worldToCanvas, getDraggableItems, zoom])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedItem || !isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const worldPos = canvasToWorld(x - dragOffset.x, y - dragOffset.y)
    
    // Apply boundary constraints based on object category
    let newPosition = {
      x: worldPos.x,
      y: draggedItem.position.y,
      z: worldPos.z
    }

    if (draggedItem.category === 'room') {
      // Room objects must stay within room boundaries
      newPosition = {
        x: Math.max(-25, Math.min(25, worldPos.x)),
        y: draggedItem.position.y,
        z: Math.max(-25, Math.min(25, worldPos.z))
      }
    } else if (draggedItem.category === 'wall') {
      // Wall panels must stay on walls - constrain to wall positions
      const roomSize = 25
      const wallThickness = 0.5
      
      // Snap to nearest wall
      if (Math.abs(worldPos.x) > Math.abs(worldPos.z)) {
        // Closer to left/right walls
        if (worldPos.x < 0) {
          newPosition.x = -roomSize
        } else {
          newPosition.x = roomSize
        }
        newPosition.z = Math.max(-roomSize, Math.min(roomSize, worldPos.z))
      } else {
        // Closer to front/back walls
        if (worldPos.z < 0) {
          newPosition.z = -roomSize
        } else {
          newPosition.z = roomSize
        }
        newPosition.x = Math.max(-roomSize, Math.min(roomSize, worldPos.x))
      }
    }

    // Update position based on object type
    if (draggedItem.type === 'object') {
      // Find the correct object type to update
      const objectTypes = ['chairs', 'lamps', 'plants', 'table', 'bookshelf', 'reception']
      for (const objectType of objectTypes) {
        const objects = config.objects[objectType as keyof typeof config.objects]
        if (Array.isArray(objects)) {
          const found = objects.find(obj => obj.id === draggedItem.id)
          if (found) {
            updateObject(objectType as any, draggedItem.id, { position: newPosition })
            break
          }
        } else if (objects && objects.id === draggedItem.id) {
          updateObject(objectType as any, draggedItem.id, { position: newPosition })
          break
        }
      }
    } else if (draggedItem.type === 'panel') {
      updatePanel(draggedItem.id, { position: newPosition })
    }
  }, [draggedItem, isDragging, dragOffset, canvasToWorld, updateObject, updatePanel, config.objects])

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null)
    setIsDragging(false)
  }, [])

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.2, Math.min(2, prev * delta)))
  }, [])

  // Redraw when config changes
  useEffect(() => {
    drawFloorPlan()
  }, [drawFloorPlan, config])

  // Keyboard shortcut for switching to 3D
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || (e.ctrlKey && e.key === '3')) {
        e.preventDefault()
        handleSwitchTo3D()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Set up canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      try {
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        drawFloorPlan()
      } catch (error) {
        console.error('Error resizing canvas:', error)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [drawFloorPlan])

  const handleSwitchTo3D = () => {
    setShowSwitchDialog(true)
  }

  const handleConfirmSwitch = () => {
    setViewMode('3d')
    setShowSwitchDialog(false)
  }

  const handleCancelSwitch = () => {
    setShowSwitchDialog(false)
  }

  return (
    <div className="w-full h-full relative bg-slate-900">
      {/* Switch to 3D Button - Prominent */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <button
          onClick={handleSwitchTo3D}
          className="backdrop-blur-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-blue-400/40 text-white px-6 py-3 rounded-xl shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg group-hover:scale-110 transition-transform">👁️</span>
            <span className="font-medium">Switch to 3D View</span>
            <span className="text-sm opacity-80">Apply Changes</span>
          </div>
        </button>
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="backdrop-blur-xl bg-slate-800/60 border border-slate-400/40 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs text-gray-300">Zoom:</span>
            <span className="text-xs text-white">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setZoom(prev => Math.max(0.2, prev * 0.8))}
              className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600"
            >
              -
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600"
            >
              Reset
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(2, prev * 1.25))}
              className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600"
            >
              +
            </button>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-slate-800/60 border border-slate-400/40 rounded-lg p-3">
          <div className="text-xs text-gray-300 mb-2">Pan</div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setPan(prev => ({ ...prev, y: prev.y + 20 }))}
              className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600"
            >
              ↑
            </button>
            <button
              onClick={() => setPan(prev => ({ ...prev, x: prev.x - 20 }))}
              className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600"
            >
              ←
            </button>
            <button
              onClick={() => setPan(prev => ({ ...prev, x: prev.x + 20 }))}
              className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600"
            >
              →
            </button>
            <button
              onClick={() => setPan(prev => ({ ...prev, y: prev.y - 20 }))}
              className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600"
            >
              ↓
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="backdrop-blur-xl bg-slate-800/60 border border-slate-400/40 rounded-lg p-3">
          <div className="text-xs text-gray-300">
            <div>• Drag room objects (circles) to reposition within room</div>
            <div>• Drag wall panels (rectangles) to reposition on walls only</div>
            <div>• Red objects are outside boundaries (room or walls)</div>
            <div>• Wall panels snap to nearest wall automatically</div>
            <div>• Use mouse wheel to zoom, pan controls to move view</div>
            <div className="mt-2 pt-2 border-t border-slate-500/40">
              <div>• Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-[10px]">Esc</kbd> or <kbd className="px-1 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+3</kbd> to switch to 3D</div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Info */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="backdrop-blur-xl bg-slate-800/60 border border-slate-400/40 rounded-lg p-3">
          <div className="text-xs text-gray-300">
            <div className="font-medium mb-1">Room Layout</div>
            <div>• Green dot: Room center</div>
            <div>• Gray area: Floor space</div>
            <div>• Circles: Room objects (stay in room)</div>
            <div>• Rectangles: Wall panels (stay on walls)</div>
            <div>• Green corners: Room boundaries</div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'crosshair' }}
      />

      {/* Switch to 3D Confirmation Dialog */}
      {showSwitchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">👁️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Switch to 3D View?</h3>
              <p className="text-gray-600">
                Your changes will be applied and you'll switch to 3D viewing mode to see your office space in 3D.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmSwitch}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Apply & Switch to 3D
              </button>
              <button
                onClick={handleCancelSwitch}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
