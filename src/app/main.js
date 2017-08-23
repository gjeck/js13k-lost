import RunLoop from './run_loop'
import EventEmitter from 'events'
import Graphics from './graphics'
import GameInputController from './game_input_controller'
import Hero from './hero'
import Camera from './camera'
import Map from './map'
import DevStats from './dev_stats'
import MazeGenerator from './maze'
import Quadtree from './quadtree'
import { randomIntInRange } from './utils'
import CollisionResolver from './collision_resolver'

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('canvas')
  const graphics = Graphics({ canvas: canvas })
  graphics.smooth(false)
  const emitter = new EventEmitter()
  const runLoop = RunLoop({ emitter: emitter })
  const devStats = DevStats({ elem: document.getElementById('devStats') })
  const mazeGenerator = MazeGenerator()
  const map = Map({
    graphics: graphics,
    maze: mazeGenerator.generate(16, 16, randomIntInRange(16), randomIntInRange(16))
  })
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
    x: 20,
    y: 20,
    gameInputController: gameInputController
  })

  let treePadding = map.tileSize
  const quadtree = Quadtree({
    x: -treePadding,
    y: -treePadding,
    width: map.cols * map.tileSize + treePadding * 2,
    height: map.rows * map.tileSize + treePadding * 2
  })

  const collisionResolver = CollisionResolver()
  const tiles = map.getAllTiles()

  emitter.on('RunLoop:begin', (timeStamp, frameDelta) => {
    devStats.tick()
  })

  emitter.on('RunLoop:update', (delta) => {
    hero.update(delta)

    quadtree.insert(hero)
    tiles.forEach((tile) => { quadtree.insert(tile) })

    let results = quadtree.query(hero.frame)
    collisionResolver.resolve(hero.frame, results)
  })

  emitter.on('RunLoop:render', (interpolationPercentage) => {
    graphics.reset()
    camera.begin()
    camera.follow(hero.frame)
    map.render(camera.viewport)
    hero.render()
    camera.end()
  })

  emitter.on('RunLoop:end', (fps, panic) => {
    devStats.render(fps, panic)

    quadtree.removeAll()
    devStats.tock()
  })

  emitter.on('GameInputController:mousedown', (e) => {
    canvas.classList.toggle('shake')
    canvas.addEventListener('animationend', () => {
      canvas.classList.toggle('shake')
    }, {once: true})
  })

  runLoop.start()
})
