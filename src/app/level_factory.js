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
import createLevel from './level'
import createHud from './hud'

function createLevelFactory(spec) {
  const s = spec || {}
  const emitter = s.emitter
  const graphics = s.graphics
  const soundController = s.soundController
  const enemySpawnLikelihood = s.enemySpawnLikelihood || 0.08

  const makeLevel = (levelCount, maxLevels) => {
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
      emitter: emitter,
      soundController: soundController
    })

    const heroFrame = createBoundingRect({ x: 20, y: 20, width: 27, height: 27 })
    const projectiles = []
    for (let i = 0; i < 5; ++i) {
      const arrowFrame = createBoundingRect({ x: 0, y: 0, width: 15, height: 15 })
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
    for (let i = 0; i < map.rows; ++i) {
      for (let j = 0; j < map.cols; ++j) {
        if (i < 4 && j < 4) {
          continue
        }
        const spawnRate = enemySpawnLikelihood + (enemySpawnLikelihood * (levelCount / maxLevels))
        if (spawnRate < Math.random()) {
          continue
        }
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
      width: graphics.canvas.width,
      height: graphics.canvas.height,
      target: hero,
      graphics: graphics,
      map: map
    })

    const hud = createHud({
      emitter: emitter,
      graphics: graphics,
      hero: hero,
      level: levelCount,
      maxLevels: maxLevels
    })

    return createLevel({
      emitter: emitter,
      gameInputController: gameInputController,
      soundController: soundController,
      hero: hero,
      enemies: enemies,
      projectiles: projectiles,
      quadtree: quadtree,
      map: map,
      collisionResolver: collisionResolver,
      graphics: graphics,
      camera: camera,
      light: light,
      hud: hud
    })
  }

  return {
    makeLevel: makeLevel
  }
}

export { createLevelFactory as default }
