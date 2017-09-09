import { clamp } from './utils'

function createCamera(spec) {
  const s = spec || {}
  const graphics = s.graphics
  let maxX = s.maxX || 1000.0
  let maxY = s.maxY || 1000.0
  let distance = s.distance || 1000.0
  let fieldOfView = s.fieldOfView || Math.PI / 4.0
  const viewportOffset = s.viewportOffset || 10
  const lookat = s.lookat || { x: 0, y: 0 }
  const viewport = s.viewport || {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
    scale: { x: 0, y: 0 }
  }
  let aspectRatio = s.aspectRatio || 1.0

  const updateViewport = () => {
    aspectRatio = graphics.canvas.width / graphics.canvas.height
    viewport.width = distance * Math.tan(fieldOfView)
    viewport.height = viewport.width / aspectRatio
    viewport.left = lookat.x - (viewport.width / 2.0) - viewportOffset
    viewport.top = lookat.y - (viewport.height / 2.0) - viewportOffset
    viewport.right = viewport.left + viewport.width
    viewport.bottom = viewport.top + viewport.height
    viewport.scale.x = graphics.canvas.width / viewport.width
    viewport.scale.y = graphics.canvas.height / viewport.height
  }

  const begin = () => {
    graphics.ctx.save()
    graphics.ctx.scale(viewport.scale.x, viewport.scale.y)
    graphics.ctx.translate(-viewport.left, -viewport.top)
  }

  const end = () => {
    graphics.ctx.restore()
  }

  const zoomTo = (z) => {
    distance = z
    updateViewport()
  }

  const moveTo = (x, y) => {
    lookat.x = x
    lookat.y = y
    updateViewport()
  }

  const screenToWorld = (x, y, obj) => {
    obj = obj || {}
    obj.x = (x / viewport.scale.x) + viewport.left
    obj.y = (y / viewport.scale.y) + viewport.top
    return obj
  }

  const worldToScreen = (x, y, obj) => {
    obj = obj || {}
    obj.x = (x - viewport.left) * (viewport.scale.x)
    obj.y = (y - viewport.top) * (viewport.scale.y)
    return obj
  }

  const follow = (rect) => {
    // Clamp the camera position to the world bounds while centering the camera around the follow
    lookat.x = clamp(rect.x, viewport.width / 2, maxX - viewport.width / 2)
    lookat.y = clamp(rect.y, viewport.height / 2, maxY - viewport.height / 2)
    updateViewport()
  }

  updateViewport()

  return {
    follow: follow,
    begin: begin,
    end: end,
    updateViewport: updateViewport,
    zoomTo: zoomTo,
    moveTo: moveTo,
    screenToWorld: screenToWorld,
    worldToScreen: worldToScreen,
    viewport: viewport
  }
}

export { createCamera as default }
