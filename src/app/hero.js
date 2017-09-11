import createBoundingRect from './bounding_rect'
import { createMeta, MetaType, MetaStatus } from './meta'

function createHero(spec) {
  const s = spec || {}
  s.type = s.type || MetaType.hero
  const graphics = s.graphics
  const inputController = s.gameInputController
  const emitter = s.emitter
  const meta = s.meta || createMeta(s)
  const frame = s.frame || createBoundingRect(s)
  const speed = s.speed || 0.32
  const dashResetTimeout = s.dashTimeout || 3000
  const dashTimeout = s.dashLength || 500
  const ammunition = s.ammunition || []
  let dashResetTimerId = null
  let isDashing = false
  let alphaResetTimerId = null
  let alpha = 1.0

  const getAlpha = () => {
    if (isDashing && !alphaResetTimerId) {
      alpha = 0.1
      alphaResetTimerId = setTimeout(() => {
        alpha = alphaResetTimerId % 2 === 0 ? 1.0 : 0.1
        alphaResetTimerId = null
      }, 100)
    } else {
      alpha = 1.0
    }
    return alpha
  }

  const update = (delta) => {
    if ((meta.status & MetaStatus.active) === 0) {
      return
    }
    const newSpeed = isDashing ? speed * 2 : speed
    if (inputController.isUp()) {
      frame.y -= delta * newSpeed
    } else if (inputController.isDown()) {
      frame.y += delta * newSpeed
    }
    if (inputController.isRight()) {
      frame.x += delta * newSpeed
    } else if (inputController.isLeft()) {
      frame.x -= delta * newSpeed
    }
  }

  const render = () => {
    if ((meta.status & MetaStatus.visible) === 0) {
      return
    }
    graphics.ctx.save()
    graphics.ctx.fillStyle = 'white'
    graphics.ctx.globalAlpha = getAlpha()
    graphics.drawCircle(frame.x, frame.y, frame.width / 2)
    graphics.ctx.restore()
  }

  const onKeyDown = (e) => {
    if (dashResetTimerId || !inputController.isDash()) {
      return
    }
    meta.status |= MetaStatus.invulnerable
    isDashing = true
    emitter.emit('Hero:isDashing')
    setTimeout(() => {
      isDashing = false
      meta.status &= ~MetaStatus.invulnerable
    }, dashTimeout)
    dashResetTimerId = setTimeout(() => {
      dashResetTimerId = null
    }, dashResetTimeout)
  }

  const onMouseDown = (mouse) => {
    emitter.emit('Hero:onMouseDown', ammunition)
    if (ammunition.length <= 0) {
      return
    }
    const projectile = ammunition.pop()
    projectile.fire(mouse.x, mouse.y)
  }

  const onTouchProjectile = (projectile) => {
    ammunition.push(projectile)
  }

  const unregisterListeners = () => {
    emitter.removeListener('GameInputController:keydown', onKeyDown)
    emitter.removeListener('GameInputController:mousedown', onMouseDown)
    emitter.removeListener('CollisionResolver:heroTouchedProjectile', onTouchProjectile)
  }

  emitter.on('GameInputController:keydown', onKeyDown)
  emitter.on('GameInputController:mousedown', onMouseDown)
  emitter.on('CollisionResolver:heroTouchedProjectile', onTouchProjectile)

  return {
    frame: frame,
    update: update,
    render: render,
    meta: meta,
    ammunition: ammunition,
    unregisterListeners: unregisterListeners
  }
}

export { createHero as default }
