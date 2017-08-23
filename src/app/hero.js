import BoundingRect from './bounding_rect'

function Hero(spec) {
  const s = spec || {}
  s.width = s.width || 25
  s.height = s.height || 25
  const graphics = s.graphics
  const inputController = s.gameInputController
  let frame = s.rect || BoundingRect(spec)
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
    render: render
  }
}

export { Hero as default }
