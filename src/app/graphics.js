export default function Graphics(spec) {
  const s = spec || {}
  const canvas = s.canvas
  const ctx = s.canvas.getContext('2d')
  const initialWidth = canvas.width
  const initialHeight = canvas.height
  const containerWindow = s.containerWindow || window
  let ratio = s.ratio || {}

  const resize = () => {
    const scale = Math.min(
      containerWindow.innerWidth / initialWidth,
      containerWindow.innerHeight / initialHeight
    )

    canvas.style.width = (initialWidth * scale) + 'px'
    canvas.style.height = (initialHeight * scale) + 'px'
    ratio.x = initialWidth / (initialWidth * scale)
    ratio.y = initialHeight / (initialHeight * scale)
  }

  const drawCircle = (x, y, radius) => {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
  }

  canvas.addEventListener('click', function() {
    this.focus()
  })

  // disable right click
  canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault()
  })

  resize()
  containerWindow.addEventListener('resize', resize)

  return {
    canvas: canvas,
    ctx: ctx,
    resize: resize,
    ratio: ratio,
    drawCircle: drawCircle
  }
}
