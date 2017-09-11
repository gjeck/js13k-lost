function createGameInputController(spec) {
  const s = spec || {}
  const graphics = s.graphics
  const camera = s.camera
  const emitter = s.emitter
  const soundController = s.soundController
  const docWindow = s.docWindow || window
  const keyboard = {}
  const mouse = {}
  let paused = true

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

  const isPaused = () => {
    return paused
  }

  const onKeyUp = (e) => {
    keyboard[e.code] = false
  }

  const onKeyDown = (e) => {
    keyboard[e.code] = true
    if (e.code === KeyMapping.dash && e.target === graphics.canvas) {
      e.preventDefault()
    }
    if (e.code === KeyMapping.pause) {
      paused = !paused
      const event = new Event('GameInputController:gamePauseToggled')
      docWindow.dispatchEvent(event)
    }
    if (!isPaused()) {
      emitter.emit('GameInputController:keydown', e)
    }
    if (e.code === KeyMapping.mute) {
      soundController.muted = !soundController.muted
    }
  }

  const onMenuPlay = () => {
    paused = !paused
  }

  const onMouseMove = (e) => {
    setMousePoint(e.clientX, e.clientY)
  }

  const onMouseDown = (e) => {
    setMousePoint(e.clientX, e.clientY)
    mouse.down = true
    if (!isPaused()) {
      emitter.emit('GameInputController:mousedown', mouse)
    }
  }

  const onMouseUp = (e) => {
    setMousePoint(e.clientX, e.clientY)
    mouse.down = false
  }

  const unregisterListeners = () => {
    docWindow.removeEventListener('keyup', onKeyUp)
    docWindow.removeEventListener('keydown', onKeyDown)
    docWindow.removeEventListener('Menu:playButtonPressed', onMenuPlay)
    graphics.canvas.removeEventListener('mousemove', onMouseMove)
    graphics.canvas.removeEventListener('mousedown', onMouseDown)
    graphics.canvas.removeEventListener('mouseup', onMouseUp)
  }

  docWindow.addEventListener('keyup', onKeyUp)
  docWindow.addEventListener('keydown', onKeyDown)
  docWindow.addEventListener('Menu:playButtonPressed', onMenuPlay)
  graphics.canvas.addEventListener('mousemove', onMouseMove)
  graphics.canvas.addEventListener('mousedown', onMouseDown)
  graphics.canvas.addEventListener('mouseup', onMouseUp)

  return {
    isUp: isUp,
    isLeft: isLeft,
    isDown: isDown,
    isRight: isRight,
    isDash: isDash,
    isPaused: isPaused,
    mouse: mouse,
    unregisterListeners: unregisterListeners
  }
}

const KeyMapping = Object.freeze({
  up: 'KeyW',
  left: 'KeyA',
  down: 'KeyS',
  right: 'KeyD',
  pause: 'KeyP',
  mute: 'KeyM',
  dash: 'Space'
})

export {
  createGameInputController as default,
  KeyMapping
}
