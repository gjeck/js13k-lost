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

function createProjectileAttackBehavior(spec) {
  const s = spec || {}
  const frame = s.frame
  const targetFrame = s.targetFrame
  const emitter = s.emitter
  const actionDistance = s.actionDistance || 350
  const fireLikelihood = s.fireLikelihood || 0.02
  const ammunition = s.ammunition || []
  const state = {}
  state.currentAmmoIndex = 0
  state.fireCooldownTimerId = null

  const nextAmmoIndex = () => {
    const currentIndex = state.currentAmmoIndex
    state.currentAmmoIndex = (currentIndex + 1) % ammunition.length
    return currentIndex
  }

  const update = () => {
    const x = targetFrame.centerX() - frame.centerX()
    const y = targetFrame.centerY() - frame.centerY()
    const hypotenuse = Math.hypot(x, y)
    if (hypotenuse < actionDistance && !state.fireCooldownTimerId && Math.random() < fireLikelihood) {
      const ammo = ammunition[nextAmmoIndex()]
      ammo.fire(targetFrame.centerX(), targetFrame.centerY())
      emitter.emit('Enemy:didFire')
      state.fireCooldownTimerId = setTimeout(() => {
        state.fireCooldownTimerId = null
      }, 1000)
    }
  }

  return {
    update: update
  }
}

function createRoundProjectileRenderer(spec) {
  const graphics = spec.graphics
  const frame = spec.frame

  const render = () => {
    graphics.ctx.save()
    graphics.ctx.fillStyle = '#0D0049'
    graphics.drawCircle(frame.x, frame.y, frame.width / 2)
    graphics.ctx.restore()
  }

  return {
    render: render
  }
}

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
      health: 120,
      gameInputController: gameInputController,
      emitter: emitter,
      ammunition: [].concat(projectiles)
    })

    const enemies = []
    const enemyProjectiles = []
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

        if (Math.random() > 0.4) {
          const enemyFrame = createBoundingRect({ x: x, y: y, width: 40, height: 40 })
          const movementBehavior = createRandomMovementBehavior({
            frame: enemyFrame,
            targetFrame: hero.frame,
            speed: 0.09
          })

          const enemyProjectileFrame = createBoundingRect({ x: 0, y: 0, width: 15, height: 15 })
          const enemyProjectileRenderer = createRoundProjectileRenderer({
            graphics: graphics,
            frame: enemyProjectileFrame
          })
          const ammo = []
          for (let k = 0; k < 3; ++k) {
            const enemyProjectile = createProjectile({
              frame: enemyProjectileFrame,
              renderer: enemyProjectileRenderer,
              sourceFrame: enemyFrame,
              graphics: graphics,
              type: MetaType.enemyArrow,
              status: MetaStatus.none,
              damage: 20,
              speed: 0.51
            })
            ammo.push(enemyProjectile)
            enemyProjectiles.push(enemyProjectile)
          }

          const attackBehavior = createProjectileAttackBehavior({
            frame: enemyFrame,
            targetFrame: hero.frame,
            ammunition: ammo,
            emitter: emitter
          })

          const enemy = createEnemy({
            graphics: graphics,
            frame: enemyFrame,
            movementBehavior: movementBehavior,
            attackBehavior: attackBehavior,
            health: 8,
            damage: 1,
            type: MetaType.enemy
          })
          enemies.push(enemy)
        } else {
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
      enemyProjectiles: enemyProjectiles,
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
