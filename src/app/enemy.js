import createBoundingRect from './bounding_rect'
import { createMeta, MetaStatus } from './meta'

function createEnemy(spec) {
  const s = spec || {}
  const graphics = s.graphics
  const movementBehavior = s.movementBehavior
  const frame = s.frame || createBoundingRect(s)
  const meta = s.meta || createMeta(s)

  const update = (delta) => {
    if ((meta.status & MetaStatus.active) === 0) {
      return
    }
    movementBehavior.update(delta)
  }

  const render = (viewport) => {
    if (!frame.intersectsViewport(viewport)) {
      return
    }
    if ((meta.status & MetaStatus.visible) === 0) {
      return
    }
    graphics.ctx.save()
    graphics.ctx.fillStyle = '#DB2E1B'
    graphics.drawCircle(frame.x, frame.y, frame.width / 2)
    graphics.ctx.restore()
  }

  return {
    frame: frame,
    update: update,
    render: render,
    meta: meta
  }
}

export { createEnemy as default }
