import RunLoop from './run_loop'
import EventEmitter from 'events'
import Graphics from './graphics'
import GameInputController from './game_input_controller'
import Hero from './hero'
import Camera from './camera'
import Map from './map'
import DevStats from './dev_stats'

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('canvas')
  const graphics = Graphics({ canvas: canvas })
  graphics.smooth(false)
  const emitter = new EventEmitter()
  const runLoop = RunLoop({ emitter: emitter })
  const devStats = DevStats({ elem: document.getElementById('devStats') })
  const map = Map({ graphics: graphics })
  const camera = Camera({
    graphics: graphics,
    maxX: map.cols * map.tileSize,
    maxY: map.rows * map.tileSize
  })
  const gameInputController = GameInputController({
    graphics: graphics,
    emitter: emitter
  })
  const hero = Hero({
    graphics: graphics,
    gameInputController: gameInputController
  })

  emitter.on('RunLoop:begin', (timeStamp, frameDelta) => {
  })

  emitter.on('RunLoop:update', (delta) => {
    hero.update(delta)
  })

  emitter.on('RunLoop:render', (interpolationPercentage) => {
    graphics.reset()
    camera.begin()
    camera.follow(hero.frame)
    map.render(0, camera.viewport)
    hero.render()
    map.render(1, camera.viewport)
    camera.end()
  })

  emitter.on('RunLoop:end', (fps, panic) => {
    devStats.render(fps, panic)
  })

  emitter.on('GameInputController:mousedown', (e) => {
    canvas.classList.toggle('shake')
    canvas.addEventListener('animationend', () => {
      canvas.classList.toggle('shake')
    }, {once: true})
  })

  runLoop.start()
})
