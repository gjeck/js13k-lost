import BoundingRect from './bounding_rect'

function Enemy(spec) {
  const s = spec || {}
  const graphics = s.graphics
  const movementBehavior = s.movementBehavior
  const frame = s.frame || BoundingRect(spec)

  const update = (delta) => {
    movementBehavior.update(delta)
  }

  const render = () => {
    graphics.ctx.save()
    graphics.ctx.fillStyle = 'red'
    graphics.drawCircle(frame.x, frame.y, frame.width / 2)
    graphics.ctx.restore()
  }

  return {
    frame: frame,
    update: update,
    render: render
  }
}

export { Enemy as default }
