function createGraphics(spec) {
  const s = spec || {}
  const canvas = s.canvas
  const emitter = s.emitter
  const ctx = s.canvas.getContext('2d')
  const initialWidth = canvas.width
  const initialHeight = canvas.height
  const containerWindow = s.containerWindow || window
  const ratio = s.ratio || {}

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
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()
  }

  const drawRect = (x, y, width, height) => {
    ctx.beginPath()
    ctx.fillRect(x, y, width, height)
    ctx.closePath()
  }

  const reset = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  canvas.addEventListener('click', function() {
    this.focus()
  })

  // disable right click
  canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault()
  })

  emitter.on('CollisionResolver:heroTouchedEnemy', (e) => {
    if (canvas.classList.contains('animating')) {
      return
    }
    canvas.classList.add('shake')
    canvas.classList.add('animating')
    setTimeout(() => {
      canvas.classList.remove('shake')
    }, 800)
    setTimeout(() => {
      canvas.classList.remove('animating')
    }, 1200)
  })

  resize()
  containerWindow.addEventListener('resize', resize)

  return {
    canvas: canvas,
    ctx: ctx,
    resize: resize,
    ratio: ratio,
    drawCircle: drawCircle,
    drawRect: drawRect,
    reset: reset
  }
}

export { createGraphics as default }
