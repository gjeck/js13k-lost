import createBoundingRect from './bounding_rect'
import { createMeta, MetaStatus } from './meta'

function createProjectile(spec) {
  const s = spec || {}
  const sourceFrame = s.sourceFrame
  const renderer = s.renderer
  const frame = s.frame || createBoundingRect(s)
  const meta = s.meta || createMeta(s)
  const speed = s.speed || 1.2
  const targetVector = {}

  const fire = (x, y) => {
    meta.status |= MetaStatus.active | MetaStatus.visible
    frame.centerTo(sourceFrame)
    targetVector.x = x - frame.centerX()
    targetVector.y = y - frame.centerY()
    targetVector.angle = Math.atan2(targetVector.y, targetVector.x)
    const hypotenuse = Math.hypot(targetVector.x, targetVector.y)
    targetVector.x /= hypotenuse
    targetVector.y /= hypotenuse
  }

  const update = (delta) => {
    if ((meta.status & MetaStatus.active) === 0) {
      return
    }
    frame.x += targetVector.x * speed * delta
    frame.y += targetVector.y * speed * delta
  }

  const render = () => {
    if ((meta.status & MetaStatus.visible) === 0) {
      return
    }
    renderer.render(targetVector.angle)
  }

  return {
    frame: frame,
    fire: fire,
    update: update,
    render: render,
    meta: meta
  }
}

export { createProjectile as default }
