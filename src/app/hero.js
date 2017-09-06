import createBoundingRect from './bounding_rect'
import { Meta, MetaType } from './meta'

function Hero(spec) {
  const s = spec || {}
  s.width = s.width || 25
  s.height = s.height || 25
  s.type = s.type || MetaType.hero
  const graphics = s.graphics
  const inputController = s.gameInputController
  const meta = s.meta || Meta(s)
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
    graphics.drawCircle(frame.x, frame.y, frame.width / 2)
  }

  return {
    frame: frame,
    update: update,
    render: render,
    meta: meta
  }
}

export { Hero as default }
