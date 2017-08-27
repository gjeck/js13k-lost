import BoundingRect from './bounding_rect'

function Projectile(spec) {
  const s = spec || {}
  const sourceFrame = s.sourceFrame
  const renderer = s.renderer
  const frame = s.frame || BoundingRect(spec)
  const speed = s.speed || 0.9
  const targetVector = {}

  const fire = (x, y) => {
    frame.centerTo(sourceFrame)
    targetVector.x = x - frame.centerX()
    targetVector.y = y - frame.centerY()
    targetVector.angle = Math.atan2(targetVector.y, targetVector.x)
    const hypotenuse = Math.hypot(targetVector.x, targetVector.y)
    targetVector.x /= hypotenuse
    targetVector.y /= hypotenuse
  }

  const update = (delta) => {
    frame.x += targetVector.x * speed * delta
    frame.y += targetVector.y * speed * delta
  }

  const render = () => {
    renderer.render(targetVector.angle)
  }

  return {
    frame: frame,
    fire: fire,
    update: update,
    render: render
  }
}

export { Projectile as default }
