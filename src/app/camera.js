import { clamp } from './utils'

export default function Camera(spec) {
  const s = spec || {}
  const graphics = s.graphics
  let maxX = s.maxX || 1000.0
  let maxY = s.maxY || 1000.0
  let distance = s.distance || 1000.0
  let fieldOfView = s.fieldOfView || Math.PI / 4.0
  let lookat = s.lookat || { x: 0, y: 0 }
  let viewport = s.viewport || {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
    scale: { x: 0, y: 0 }
  }
  let aspectRatio = s.aspectRatio || 1.0
  let isFollowing = false

  const updateViewport = () => {
    aspectRatio = graphics.canvas.width / graphics.canvas.height
    viewport.width = distance * Math.tan(fieldOfView)
    viewport.height = viewport.width / aspectRatio
    viewport.left = lookat.x - (viewport.width / 2.0)
    viewport.top = lookat.y - (viewport.height / 2.0)
    viewport.right = viewport.left + viewport.width
    viewport.bottom = viewport.top + viewport.height
    viewport.scale.x = graphics.canvas.width / viewport.width
    viewport.scale.y = graphics.canvas.height / viewport.height
  }

  const begin = () => {
    graphics.ctx.save()
    applyScale()
    applyTranslation()
  }

  const end = () => {
    graphics.ctx.restore()
  }

  const applyScale = () => {
    graphics.ctx.scale(viewport.scale.x, viewport.scale.y)
  }

  const applyTranslation = () => {
    graphics.ctx.translate(-viewport.left, -viewport.top)
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
    isFollowing = true
    // Clamp the camera position to the world bounds while centering the camera around the follow
    lookat.x = clamp(rect.x, viewport.width / 2, maxX - viewport.width / 2)
    lookat.y = clamp(rect.y, viewport.height / 2, maxY - viewport.height / 2)
    updateViewport()
  }

  const unFollow = () => {
    isFollowing = false
  }

  updateViewport()

  return {
    isFollowing: isFollowing,
    follow: follow,
    unFollow: unFollow,
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
