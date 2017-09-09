import createBoundingRect from './bounding_rect'
import { createMeta, MetaType } from './meta'

function createHero(spec) {
  const s = spec || {}
  s.width = s.width || 27
  s.height = s.height || 27
  s.type = s.type || MetaType.hero
  const graphics = s.graphics
  const inputController = s.gameInputController
  const meta = s.meta || createMeta(s)
  const frame = s.rect || createBoundingRect(s)
  let speed = s.speed || 0.32

  const update = (delta) => {
    if (inputController.isUp()) {
      frame.y -= delta * speed
    } else if (inputController.isDown()) {
      frame.y += delta * speed
    }
    if (inputController.isRight()) {
      frame.x += delta * speed
    } else if (inputController.isLeft()) {
      frame.x -= delta * speed
    }
  }

  const render = () => {
    graphics.ctx.save()
    graphics.ctx.fillStyle = 'white'
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

export { createHero as default }
