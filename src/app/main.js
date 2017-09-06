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
import Projectile from './projectile'
import ArrowRenderer from './arrow_renderer'
import { MetaType } from './meta'
import Light from './light'

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('canvas')
  const graphics = Graphics({ canvas: canvas })
  graphics.ctx.imageSmoothingEnabled = false
  const emitter = new EventEmitter()
  const runLoop = RunLoop({ emitter: emitter })
  const devStats = DevStats({ elem: document.getElementById('devStats') })
  const mazeGenerator = MazeGenerator()
  const map = Map({
    graphics: graphics,
    maze: mazeGenerator.generate(20, 20, randomIntInRange(20), randomIntInRange(20))
  })
  const camera = Camera({
    graphics: graphics,
    maxX: map.cols * map.tileSize + map.wallDimension(),
    maxY: map.rows * map.tileSize + map.wallDimension(),
    viewportOffset: map.wallDimension() / 2
  })
  const gameInputController = GameInputController({
    graphics: graphics,
    camera: camera,
    emitter: emitter
  })
  const hero = Hero({
    graphics: graphics,
    x: 20,
    y: 20,
    health: 100,
    gameInputController: gameInputController
  })

  const enemies = []
  for (let i = map.rows / 4; i < map.rows; i += 2) {
    for (let j = map.cols / 4; j < map.cols; j += 2) {
      let x = map.tileSize * j + (map.tileSize / 2)
      let y = map.tileSize * i + (map.tileSize / 2)
      const enemyFrame = BoundingRect({ x: x, y: y, width: 25, height: 25 })
      const movementBehavior = RandomMovementBehavior({
        frame: enemyFrame,
        targetFrame: hero.frame
      })

      const enemy = Enemy({
        graphics: graphics,
        frame: enemyFrame,
        movementBehavior: movementBehavior,
        health: 1,
        type: MetaType.enemy
      })
      enemies.push(enemy)
    }
  }

  const arrowFrame = BoundingRect({ x: 0, y: 0, width: 10, height: 10 })
  const arrowRenderer = ArrowRenderer({ graphics: graphics, frame: arrowFrame })
  const arrow = Projectile({
    frame: arrowFrame,
    renderer: arrowRenderer,
    sourceFrame: hero.frame,
    graphics: graphics,
    type: MetaType.arrow,
    damage: 1
  })

  const treePadding = map.tileSize
  const quadtree = Quadtree({
    x: -treePadding,
    y: -treePadding,
    width: map.cols * map.tileSize + treePadding * 2,
    height: map.rows * map.tileSize + treePadding * 2
  })

  const collisionResolver = CollisionResolver()

  const light = Light({
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    target: hero,
    graphics: graphics,
    map: map
  })

  emitter.on('RunLoop:begin', (timeStamp, frameDelta) => {
    devStats.tick()
  })

  emitter.on('RunLoop:update', (delta) => {
    hero.update(delta)
    enemies.forEach((enemy) => { enemy.update(delta) })
    arrow.update(delta)

    quadtree.insert(hero)
    enemies.forEach((enemy) => { quadtree.insert(enemy) })
    map.walls.forEach((wall) => { quadtree.insert(wall) })
    quadtree.insert(arrow)

    const results = quadtree.query(hero.frame)
    collisionResolver.resolve(hero, results)

    enemies.forEach((enemy) => {
      const enemyResults = quadtree.query(enemy.frame)
      collisionResolver.resolve(enemy, enemyResults)
    })

    const arrowResults = quadtree.query(arrow.frame)
    collisionResolver.resolve(arrow, arrowResults)
  })

  emitter.on('RunLoop:render', (interpolationPercentage) => {
    graphics.reset()

    graphics.ctx.save()
    graphics.ctx.fillStyle = 'black'
    graphics.ctx.globalAlpha = 0.9
    graphics.ctx.fillRect(0, 0, graphics.canvas.width, graphics.canvas.height)
    graphics.ctx.restore()

    camera.begin()
    camera.follow(hero.frame)
    light.calculateIntersections(camera.viewport)
    light.render()
    map.render(camera.viewport)
    arrow.render()
    hero.render()
    enemies.forEach((enemy) => { enemy.render() })
    camera.end()
  })

  emitter.on('RunLoop:end', (fps, panic) => {
    devStats.render(fps, panic)

    quadtree.removeAll()
    devStats.tock()
  })

  emitter.on('GameInputController:mousedown', (e) => {
    // canvas.classList.toggle('shake')
    // canvas.addEventListener('animationend', () => {
    //   canvas.classList.toggle('shake')
    // }, {once: true})
    arrow.fire(gameInputController.mouse.x, gameInputController.mouse.y)
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
