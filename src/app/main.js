import createRunLoop from './run_loop'
import EventEmitter from 'events'
import createGraphics from './graphics'
import createGameInputController from './game_input_controller'
import createHero from './hero'
import createCamera from './camera'
import createMap from './map'
import createMazeGenerator from './maze'
import Quadtree from './quadtree'
import { randomIntInRange } from './utils'
import createCollisionResolver from './collision_resolver'
import createEnemy from './enemy'
import { createRandomMovementBehavior } from './movement_behavior'
import createBoundingRect from './bounding_rect'
import createProjectile from './projectile'
import createArrowRenderer from './arrow_renderer'
import { MetaType, MetaStatus } from './meta'
import createLight from './light'

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('canvas')
  const emitter = new EventEmitter()
  const graphics = createGraphics({ canvas: canvas, emitter: emitter })
  graphics.ctx.imageSmoothingEnabled = false
  const runLoop = createRunLoop({ emitter: emitter })
  const mazeGenerator = createMazeGenerator()
  const map = createMap({
    graphics: graphics,
    maze: mazeGenerator.generate(20, 20, randomIntInRange(20), randomIntInRange(20))
  })
  const camera = createCamera({
    graphics: graphics,
    maxX: map.cols * map.tileSize + map.wallDimension(),
    maxY: map.rows * map.tileSize + map.wallDimension(),
    viewportOffset: map.wallDimension() / 2
  })
  const gameInputController = createGameInputController({
    graphics: graphics,
    camera: camera,
    emitter: emitter
  })

  const heroFrame = createBoundingRect({ x: 20, y: 20, width: 27, height: 27 })
  const projectiles = []
  for (let i = 0; i < 5; ++i) {
    const arrowFrame = createBoundingRect({ x: 0, y: 0, width: 11, height: 11 })
    const arrowRenderer = createArrowRenderer({ graphics: graphics, frame: arrowFrame })
    const arrow = createProjectile({
      frame: arrowFrame,
      renderer: arrowRenderer,
      sourceFrame: heroFrame,
      graphics: graphics,
      type: MetaType.arrow,
      status: MetaStatus.none,
      damage: 1
    })
    projectiles.push(arrow)
  }

  const hero = createHero({
    graphics: graphics,
    frame: heroFrame,
    health: 100,
    gameInputController: gameInputController,
    emitter: emitter,
    ammunition: [].concat(projectiles)
  })

  const enemies = []
  for (let i = map.rows / 4; i < map.rows; i += 2) {
    for (let j = map.cols / 4; j < map.cols; j += 4) {
      let x = map.tileSize * j + (map.tileSize / 2)
      let y = map.tileSize * i + (map.tileSize / 2)
      const enemyFrame = createBoundingRect({ x: x, y: y, width: 25, height: 25 })
      const movementBehavior = createRandomMovementBehavior({
        frame: enemyFrame,
        targetFrame: hero.frame
      })

      const enemy = createEnemy({
        graphics: graphics,
        frame: enemyFrame,
        movementBehavior: movementBehavior,
        health: 1,
        damage: 1,
        type: MetaType.enemy
      })
      enemies.push(enemy)
    }
  }

  const quadtree = Quadtree({
    x: -map.tileSize,
    y: -map.tileSize,
    width: map.cols * map.tileSize + map.tileSize * 2,
    height: map.rows * map.tileSize + map.tileSize * 2
  })

  const collisionResolver = createCollisionResolver({ emitter: emitter })

  const light = createLight({
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    target: hero,
    graphics: graphics,
    map: map
  })

  emitter.on('RunLoop:begin', (timeStamp, frameDelta) => {
  })

  emitter.on('RunLoop:update', (delta) => {
    hero.update(delta)
    enemies.forEach((enemy) => { enemy.update(delta) })
    projectiles.forEach((projectile) => { projectile.update(delta) })

    quadtree.insert(hero)
    projectiles.forEach((projectile) => { quadtree.insert(projectile) })
    enemies.forEach((enemy) => { quadtree.insert(enemy) })
    map.walls.forEach((wall) => { quadtree.insert(wall) })

    const results = quadtree.query(hero.frame)
    collisionResolver.resolve(hero, results)

    enemies.forEach((enemy) => {
      const enemyResults = quadtree.query(enemy.frame)
      collisionResolver.resolve(enemy, enemyResults)
    })

    projectiles.forEach((projectile) => {
      const projectileResults = quadtree.query(projectile.frame)
      collisionResolver.resolve(projectile, projectileResults)
    })
  })

  emitter.on('RunLoop:render', (interpolationPercentage) => {
    graphics.reset()
    camera.begin()
    camera.follow(hero.frame)
    enemies.forEach((enemy) => { enemy.render(camera.viewport) })
    projectiles.forEach((projectile) => { projectile.render() })
    light.calculateIntersections(camera.viewport)
    light.render()
    map.render(camera.viewport)
    hero.render()
    camera.end()
  })

  emitter.on('RunLoop:end', (fps, panic) => {
    quadtree.removeAll()
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
