import BoundingRect from './bounding_rect'

export default function Hero(spec) {
  const s = spec || {}
  s.width = s.width || 20
  s.height = s.height || 20
  const graphics = s.graphics
  const inputController = s.gameInputController
  let frame = BoundingRect(spec)
  let speed = s.speed || 0.3

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
    graphics.drawCircle(frame.x, frame.y, frame.width)
  }

  return {
    frame: frame,
    update: update,
    render: render
  }
}
