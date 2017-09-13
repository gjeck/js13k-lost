function createLevel(spec) {
  const emitter = spec.emitter
  const gameInputController = spec.gameInputController
  const hero = spec.hero
  const enemies = spec.enemies
  const projectiles = spec.projectiles
  const enemyProjectiles = spec.enemyProjectiles
  const quadtree = spec.quadtree
  const map = spec.map
  const collisionResolver = spec.collisionResolver
  const graphics = spec.graphics
  const camera = spec.camera
  const light = spec.light
  const hud = spec.hud
  const state = {}
  state.isStarted = false
  state.zoomStart = map.cols * map.tileSize + map.wallDimension()

  const begin = (timeStamp, frameDelta) => {
    if (!hero.frame.intersectsViewport(camera.viewport)) {
      emitter.emit('Level:heroExited')
    }
  }

  const update = (delta) => {
    if (gameInputController.isPaused()) {
      return
    }
    if (!state.isStarted) {
      camera.zoomTo(state.zoomStart)
      state.zoomStart -= 55
      if (state.zoomStart <= 1000) {
        state.isStarted = true
      }
      return
    }
    hero.update(delta)
    enemies.forEach((enemy) => { enemy.update(delta) })
    projectiles.forEach((projectile) => { projectile.update(delta) })
    enemyProjectiles.forEach((projectile) => { projectile.update(delta) })
    hud.update(delta)

    quadtree.insert(hero)
    projectiles.forEach((projectile) => { quadtree.insert(projectile) })
    enemyProjectiles.forEach((projectile) => { quadtree.insert(projectile) })
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

    enemyProjectiles.forEach((projectile) => {
      const enemyProjectileResults = quadtree.query(projectile.frame)
      collisionResolver.resolve(projectile, enemyProjectileResults)
    })
  }

  const render = (interpolationPercentage) => {
    graphics.reset()
    camera.begin()
    camera.follow(hero.frame)
    if (state.isStarted) {
      enemyProjectiles.forEach((projectile) => { projectile.render() })
      enemies.forEach((enemy) => { enemy.render(camera.viewport) })
      projectiles.forEach((projectile) => { projectile.render() })
      light.calculateIntersections(camera.viewport)
      light.render()
      hero.render()
    }
    map.render(camera.viewport)
    camera.end()
    hud.render()
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
    hud.unregisterListeners()
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
