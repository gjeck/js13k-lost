import createRunLoop from './run_loop'
import EventEmitter from 'events'
import createGraphics from './graphics'
import createGame from './game'
import createLevelFactory from './level_factory'
import createSoundController from './sound_controller'

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('canvas')
  const emitter = new EventEmitter()
  const graphics = createGraphics({ canvas: canvas, emitter: emitter })
  const soundController = createSoundController({ emitter: emitter })
  const runLoop = createRunLoop({ emitter: emitter })
  const levelFactory = createLevelFactory({
    emitter: emitter,
    graphics: graphics,
    soundController: soundController
  })
  const game = createGame({ emitter: emitter, levelFactory: levelFactory })

  emitter.on('RunLoop:begin', (timeStamp, frameDelta) => {
    game.begin(timeStamp, frameDelta)
  })

  emitter.on('RunLoop:update', (delta) => {
    game.update(delta)
  })

  emitter.on('RunLoop:render', (interpolationPercentage) => {
    game.render(interpolationPercentage)
  })

  emitter.on('RunLoop:end', (fps, panic) => {
    game.end(fps, panic)
  })

  document.addEventListener('visibilitychange', (e) => {
    if ((document.hidden || document.visibilityState !== 'visible') && runLoop.isRunning()) {
      runLoop.stop()
    } else if (!document.hidden && document.visibilityState === 'visible' && !runLoop.isRunning()) {
      runLoop.start()
    }
  })

  if (!document.hidden && document.visibilityState === 'visible') {
    runLoop.start()
  }
})
