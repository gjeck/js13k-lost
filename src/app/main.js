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
    maze: mazeGenerator.generate(16, 16)
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

  const tiles = map.getAllTiles()

  emitter.on('RunLoop:begin', (timeStamp, frameDelta) => {
    devStats.tick()
  })

  emitter.on('RunLoop:update', (delta) => {
    hero.update(delta)

    quadtree.insert(hero)
    tiles.forEach((tile) => { quadtree.insert(tile) })

    let results = quadtree.query(hero.frame)
    results.forEach((result) => {
      if (result === hero) {
        return
      }
      let bottomCollision = hero.frame.maxY() - result.frame.y
      let topCollision = result.frame.maxY() - hero.frame.y
      let leftCollision = result.frame.maxX() - hero.frame.x
      let rightCollision = hero.frame.maxX() - result.frame.x
      if (topCollision < bottomCollision && topCollision < leftCollision && topCollision < rightCollision) {
        hero.frame.y = result.frame.maxY()
      } else if (bottomCollision < topCollision && bottomCollision < leftCollision && bottomCollision < rightCollision) {
        hero.frame.y = result.frame.y - hero.frame.maxY() + hero.frame.y
      } else if (leftCollision < rightCollision && leftCollision < topCollision && leftCollision < bottomCollision) {
        hero.frame.x = result.frame.maxX()
      } else if (rightCollision < leftCollision && rightCollision < topCollision && rightCollision < bottomCollision) {
        hero.frame.x = result.frame.x - hero.frame.maxX() + hero.frame.x
      }
    })
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
