import RunLoop from './run_loop'
import EventEmitter from 'events'
import Graphics from './graphics'
import GameInputController from './game_input_controller'
import BoundingRect from './bounding_rect'
import Hero from './hero'

const DevStats = (spec) => {
  const s = spec || {}
  const elem = s.elem
  let isEnabled = s.isEnabled || true

  const render = function(fps, panic) {
    if (!isEnabled) {
      return
    }
    elem.innerHTML = `fps: ${(fps).toFixed(2)}`
  }

  const setIsEnabled = function(enabled) {
    isEnabled = enabled
  }

  return {
    render: render,
    setIsEnabled: setIsEnabled
  }
}

const map = {
  cols: 16,
  rows: 16,
  tileSize: 128,
  layers: [[
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ], [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]],
  getTile: function(layer, col, row) {
    return this.layers[layer][row * map.cols + col]
  }
}

function Camera(spec) {
  const s = spec || {}
  const graphics = s.graphics
  const frame = BoundingRect(s)
  frame.maxX = map.cols * map.tileSize - frame.width
  frame.maxY = map.rows * map.tileSize - frame.height
  let isFollowing = false
  let followRect

  const follow = (rect) => {
    isFollowing = true
    followRect = rect
  }

  const unFollow = () => {
    isFollowing = false
    followRect = null
  }

  const render = () => {
    if (isFollowing) {
      // Clamp the camera position to the world bounds while centering the camera around the follow
      let camX = Math.clamp(-followRect.frame.x + graphics.canvas.width / 2, 0, frame.maxX - graphics.canvas.width)
      let camY = Math.clamp(-followRect.frame.y + graphics.canvas.height / 2, 0, frame.maxY - graphics.canvas.height)

      graphics.ctx.translate(camX, camY)
    }
  }

  return {
    isFollowing: isFollowing,
    follow: follow,
    unFollow: unFollow,
    frame: frame,
    render: render
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('canvas')
  const graphics = Graphics({ canvas: canvas })
  const emitter = new EventEmitter()
  const runLoop = RunLoop({ emitter: emitter })
  const devStats = DevStats({ elem: document.getElementById('devStats') })
  const camera = Camera({
    graphics: graphics,
    map: map,
    width: canvas.width,
    height: canvas.height
  })
  const gameInputController = GameInputController({
    graphics: graphics
  })
  const hero = Hero({
    graphics: graphics,
    gameInputController: gameInputController
  })
  camera.follow(hero)

  emitter.on('runLoop:begin', (timeStamp, frameDelta) => {
  })

  emitter.on('runLoop:update', (delta) => {
    hero.update(delta)
  })

  emitter.on('runLoop:render', (interpolationPercentage) => {
    graphics.ctx.setTransform(1, 0, 0, 1, 0, 0)
    graphics.ctx.clearRect(0, 0, canvas.width, canvas.height)
    camera.render()
    hero.render()
  })

  emitter.on('runLoop:end', (fps, panic) => {
    devStats.render(fps, panic)
  })

  runLoop.start()
})
