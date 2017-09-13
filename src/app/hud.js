import createBoundingRect from './bounding_rect'

function createHud(spec) {
  const s = spec || {}
  const emitter = s.emitter
  const graphics = s.graphics
  const hero = s.hero
  const level = s.level
  const maxLevels = s.maxLevels
  const barFrameWidth = 160
  const healthBarFrame = createBoundingRect({
    x: 20,
    y: graphics.canvas.height - 60,
    width: barFrameWidth,
    height: 40
  })
  const healthBarBackgroundFrame = createBoundingRect({
    x: 20,
    y: graphics.canvas.height - 60,
    width: barFrameWidth,
    height: 40
  })
  const staminaBarFrame = createBoundingRect({
    x: 200,
    y: graphics.canvas.height - 60,
    width: barFrameWidth,
    height: 40
  })
  const staminaBarBackgroundFrame = createBoundingRect({
    x: 200,
    y: graphics.canvas.height - 60,
    width: barFrameWidth,
    height: 40
  })
  const completedLevelsFrame = createBoundingRect({
    x: graphics.canvas.width - 80,
    y: graphics.canvas.height - 15,
    width: 60,
    height: 40
  })

  const update = (delta) => {
    healthBarFrame.width = Math.max((hero.meta.health / hero.meta.totalHealth) * barFrameWidth, 0)
    staminaBarFrame.width = Math.min(barFrameWidth, staminaBarFrame.width + 0.92)
  }

  const onHeroDash = () => {
    staminaBarFrame.width = 0
  }

  const render = (interpolationPercentage) => {
    graphics.ctx.save()
    graphics.ctx.globalAlpha = 0.8
    graphics.ctx.fillStyle = '#00000C'
    graphics.drawRect(
      healthBarBackgroundFrame.x,
      healthBarBackgroundFrame.y,
      healthBarBackgroundFrame.width,
      healthBarBackgroundFrame.height
    )
    graphics.drawRect(
      staminaBarBackgroundFrame.x,
      staminaBarBackgroundFrame.y,
      staminaBarBackgroundFrame.width,
      staminaBarBackgroundFrame.height
    )
    graphics.ctx.fillStyle = '#DB2E1B'
    graphics.drawRect(healthBarFrame.x, healthBarFrame.y, healthBarFrame.width, healthBarFrame.height)
    graphics.ctx.fillStyle = '#28DB68'
    graphics.drawRect(staminaBarFrame.x, staminaBarFrame.y, staminaBarFrame.width, staminaBarFrame.height)
    graphics.ctx.fillStyle = 'white'
    graphics.ctx.font = '28px "Helvetica Neue", Helvetica, Sans-Serif'
    graphics.ctx.textBaseline = 'bottom'
    graphics.ctx.fillText(`${level} / ${maxLevels}`, completedLevelsFrame.x, completedLevelsFrame.y)
    graphics.ctx.restore()
  }

  const unregisterListeners = () => {
    emitter.removeListener('Hero:isDashing', onHeroDash)
  }

  emitter.on('Hero:isDashing', onHeroDash)

  return {
    update: update,
    render: render,
    unregisterListeners: unregisterListeners
  }
}

export { createHud as default }
