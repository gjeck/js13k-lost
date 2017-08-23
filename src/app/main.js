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
import Enemy from './enemy'
import { RandomMovementBehavior } from './movement_behavior'
import BoundingRect from './bounding_rect'

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

  const enemyFrame = BoundingRect({ x: 40, y: 120, width: 25, height: 25 })
  const movementBehavior = RandomMovementBehavior({
    frame: enemyFrame,
    targetFrame: hero.frame
  })

  const enemy = Enemy({
    graphics: graphics,
    frame: enemyFrame,
    movementBehavior: movementBehavior
  })

  let treePadding = map.tileSize
  const quadtree = Quadtree({
    x: -treePadding,
    y: -treePadding,
    width: map.cols * map.tileSize + treePadding * 2,
    height: map.rows * map.tileSize + treePadding * 2
  })

  const collisionResolver = CollisionResolver()
  const walls = map.getAllWalls()

  emitter.on('RunLoop:begin', (timeStamp, frameDelta) => {
    devStats.tick()
  })

  emitter.on('RunLoop:update', (delta) => {
    hero.update(delta)
    enemy.update(delta)

    quadtree.insert(hero)
    quadtree.insert(enemy)
    walls.forEach((wall) => { quadtree.insert(wall) })

    let results = quadtree.query(hero.frame)
    collisionResolver.resolve(hero.frame, results)

    let enemyResults = quadtree.query(enemy.frame)
    collisionResolver.resolve(enemy.frame, enemyResults)
  })

  emitter.on('RunLoop:render', (interpolationPercentage) => {
    graphics.reset()
    camera.begin()
    camera.follow(hero.frame)
    map.render(camera.viewport)
    hero.render()
    enemy.render()
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
