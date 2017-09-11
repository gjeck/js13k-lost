function createArrowRenderer(spec) {
  const s = spec || {}
  const graphics = s.graphics
  const frame = s.frame
  const arrowLength = s.arrowLength || 17
  const arrowThickness = s.arrowThickness || 8

  const render = (angle) => {
    graphics.ctx.save()
    graphics.ctx.translate(frame.centerX(), frame.centerY())
    graphics.ctx.rotate(angle)
    const x = frame.width / 2
    const y = frame.height / 2
    graphics.ctx.fillStyle = '#0D0049'
    graphics.drawRect(-x - arrowLength,
      -y + (arrowThickness / 2),
      frame.width + arrowLength,
      frame.height - arrowThickness)
    graphics.ctx.beginPath()
    graphics.ctx.moveTo(0, -y)
    graphics.ctx.lineTo(0, y)
    graphics.ctx.lineTo(frame.width, 0)
    graphics.ctx.fill()
    graphics.ctx.restore()
  }

  return {
    render: render
  }
}

export { createArrowRenderer as default }
