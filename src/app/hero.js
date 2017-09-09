import createBoundingRect from './bounding_rect'
import { createMeta, MetaType, MetaStatus } from './meta'

function createHero(spec) {
  const s = spec || {}
  s.width = s.width || 27
  s.height = s.height || 27
  s.type = s.type || MetaType.hero
  const graphics = s.graphics
  const inputController = s.gameInputController
  const emitter = s.emitter
  const meta = s.meta || createMeta(s)
  const frame = s.rect || createBoundingRect(s)
  const speed = s.speed || 0.32
  const dashResetTimeout = s.dashTimeout || 3000
  const dashTimeout = s.dashLength || 500
  let dashResetTimerId = null
  let isDashing = false
  let alphaResetTimerId = null
  let alpha = 1.0

  emitter.on('GameInputController:keydown', (e) => {
    if (dashResetTimerId || !inputController.isDash()) {
      return
    }
    meta.status |= MetaStatus.invulnerable
    isDashing = true
    setTimeout(() => {
      isDashing = false
      meta.status &= ~MetaStatus.invulnerable
    }, dashTimeout)
    dashResetTimerId = setTimeout(() => {
      dashResetTimerId = null
    }, dashResetTimeout)
  })

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
    graphics.ctx.save()
    graphics.ctx.fillStyle = 'white'
    graphics.ctx.globalAlpha = getAlpha()
    graphics.drawCircle(frame.x, frame.y, frame.width / 2)
    graphics.ctx.restore()
  }

  return {
    frame: frame,
    update: update,
    render: render,
    meta: meta
  }
}

export { createHero as default }
