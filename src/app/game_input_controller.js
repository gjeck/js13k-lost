function createGameInputController(spec) {
  const s = spec || {}
  const graphics = s.graphics
  const camera = s.camera
  const emitter = s.emitter
  const docWindow = s.docWindow || window
  const keyboard = {}
  const mouse = {}

  const setMousePoint = (x, y) => {
    mouse.x = x - graphics.canvas.offsetLeft
    mouse.y = y - graphics.canvas.offsetTop
    mouse.x *= graphics.ratio.x
    mouse.y *= graphics.ratio.y
    camera.screenToWorld(mouse.x, mouse.y, mouse)
  }

  const isUp = () => {
    return keyboard[KeyMapping.up] || false
  }

  const isLeft = () => {
    return keyboard[KeyMapping.left] || false
  }

  const isRight = () => {
    return keyboard[KeyMapping.right] || false
  }

  const isDown = () => {
    return keyboard[KeyMapping.down] || false
  }

  const isDash = () => {
    return keyboard[KeyMapping.dash] || false
  }

  docWindow.addEventListener('keyup', (e) => {
    keyboard[e.code] = false
  })

  docWindow.addEventListener('keydown', (e) => {
    keyboard[e.code] = true
    if (e.code === KeyMapping.dash && e.target === graphics.canvas) {
      e.preventDefault()
    }
    emitter.emit('GameInputController:keydown', e)
  })

  graphics.canvas.addEventListener('mousemove', (e) => {
    setMousePoint(e.clientX, e.clientY)
  })

  graphics.canvas.addEventListener('mousedown', (e) => {
    setMousePoint(e.clientX, e.clientY)
    mouse.down = true
    emitter.emit('GameInputController:mousedown', mouse)
  })

  graphics.canvas.addEventListener('mouseup', (e) => {
    setMousePoint(e.clientX, e.clientY)
    mouse.down = false
  })

  return {
    isUp: isUp,
    isLeft: isLeft,
    isDown: isDown,
    isRight: isRight,
    isDash: isDash,
    mouse: mouse
  }
}

const KeyMapping = Object.freeze({
  up: 'KeyW',
  left: 'KeyA',
  down: 'KeyS',
  right: 'KeyD',
  dash: 'Space'
})

export { createGameInputController as default }
