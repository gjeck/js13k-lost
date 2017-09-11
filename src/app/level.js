function createLevel(spec) {
  const emitter = spec.emitter
  const gameInputController = spec.gameInputController
  const hero = spec.hero
  const enemies = spec.enemies
  const projectiles = spec.projectiles
  const quadtree = spec.quadtree
  const map = spec.map
  const collisionResolver = spec.collisionResolver
  const graphics = spec.graphics
  const camera = spec.camera
  const light = spec.light

  const begin = (timeStamp, frameDelta) => {
    if (!hero.frame.intersectsViewport(camera.viewport)) {
      emitter.emit('Level:heroExited')
    }
  }

  const update = (delta) => {
    if (gameInputController.isPaused()) {
      return
    }
    hero.update(delta)
    enemies.forEach((enemy) => { enemy.update(delta) })
    projectiles.forEach((projectile) => { projectile.update(delta) })

    quadtree.insert(hero)
    projectiles.forEach((projectile) => { quadtree.insert(projectile) })
    enemies.forEach((enemy) => { quadtree.insert(enemy) })
    map.walls.forEach((wall) => { quadtree.insert(wall) })

    const heroResults = quadtree.query(hero.frame)
    collisionResolver.resolve(hero, heroResults)

    enemies.forEach((enemy) => {
      const enemyResults = quadtree.query(enemy.frame)
      collisionResolver.resolve(enemy, enemyResults)
    })

    projectiles.forEach((projectile) => {
      const projectileResults = quadtree.query(projectile.frame)
      collisionResolver.resolve(projectile, projectileResults)
    })
  }

  const render = (interpolationPercentage) => {
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
  }

  const end = (fps, panic) => {
    quadtree.removeAll()
  }

  const start = (callback) => {
    graphics.fadeIn(callback)
    gameInputController.togglePause()
  }

  const complete = (callback) => {
    graphics.fadeOut(callback)
    gameInputController.unregisterListeners()
    hero.unregisterListeners()
  }

  return {
    begin: begin,
    update: update,
    render: render,
    end: end,
    start: start,
    complete: complete
  }
}

export { createLevel as default }
