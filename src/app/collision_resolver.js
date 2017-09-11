import { MetaType, MetaStatus } from './meta'

function createCollisionResolver(spec) {
  const s = spec || {}
  const emitter = s.emitter

  const shouldIgnoreResolve = (entityMeta, itemMeta) => {
    return (entityMeta.type === MetaType.hero && itemMeta.type === MetaType.arrow) ||
      (entityMeta.type === MetaType.hero &&
        itemMeta.type === MetaType.enemy &&
        (entityMeta.status & MetaStatus.invulnerable) !== 0) ||
      (entityMeta.type === MetaType.enemy &&
        itemMeta.type === MetaType.hero &&
        (itemMeta.status & MetaStatus.invulnerable) !== 0) ||
      (itemMeta.status & MetaStatus.active) === 0 ||
      (entityMeta.status & MetaStatus.active) === 0
  }

  const resolve = (entity, collection) => {
    collection.forEach((item) => {
      if (entity === item || item.meta.type === MetaType.none) {
        return
      }
      const ignoreResolve = shouldIgnoreResolve(entity.meta, item.meta)
      const bottomCollision = entity.frame.maxY() - item.frame.y
      const topCollision = item.frame.maxY() - entity.frame.y
      const leftCollision = item.frame.maxX() - entity.frame.x
      const rightCollision = entity.frame.maxX() - item.frame.x
      let isColliding = false
      if (topCollision < bottomCollision &&
        topCollision < leftCollision &&
        topCollision < rightCollision) {
        if (!ignoreResolve) {
          entity.frame.y = item.frame.maxY()
        }
        isColliding = true
      } else if (bottomCollision < topCollision &&
        bottomCollision < leftCollision &&
        bottomCollision < rightCollision) {
        if (!ignoreResolve) {
          entity.frame.y = item.frame.y - entity.frame.maxY() + entity.frame.y
        }
        isColliding = true
      } else if (leftCollision < rightCollision &&
        leftCollision < topCollision &&
        leftCollision < bottomCollision) {
        if (!ignoreResolve) {
          entity.frame.x = item.frame.maxX()
        }
        isColliding = true
      } else if (rightCollision < leftCollision &&
        rightCollision < topCollision &&
        rightCollision < bottomCollision) {
        if (!ignoreResolve) {
          entity.frame.x = item.frame.x - entity.frame.maxX() + entity.frame.x
        }
        isColliding = true
      }
      if (isColliding) {
        handleMeta(entity, item)
      }
    })
  }

  const handleMeta = (entity, item) => {
    if (entity.meta.type === MetaType.arrow && item.meta.type === MetaType.wall) {
      entity.meta.status &= ~MetaStatus.active
    } else if (entity.meta.type === MetaType.arrow && item.meta.type === MetaType.hero) {
      if ((entity.meta.status & MetaStatus.active) === 0 && (entity.meta.status & MetaStatus.visible) !== 0) {
        entity.meta.status &= ~MetaStatus.visible
        emitter.emit('CollisionResolver:heroTouchedProjectile', entity)
      }
    } else if (entity.meta.type === MetaType.arrow && item.meta.type === MetaType.enemy) {
      if ((entity.meta.status & MetaStatus.active) !== 0) {
        item.meta.health -= entity.meta.damage
      }
      if (item.meta.health <= 0 && (item.meta.status & MetaStatus.active) !== 0) {
        item.meta.status &= ~MetaStatus.visible
        item.meta.status &= ~MetaStatus.active
        emitter.emit('CollisionResolver:enemyDied', item)
      }
    } else if (entity.meta.type === MetaType.enemy && item.meta.type === MetaType.hero) {
      if ((entity.meta.status & MetaStatus.active) !== 0 &&
        (item.meta.status & MetaStatus.active) !== 0 &&
        (item.meta.status & MetaStatus.invulnerable) === 0) {
        item.meta.health -= entity.meta.damage
        emitter.emit('CollisionResolver:heroTouchedEnemy', entity)
      }
      if (item.meta.health <= 0 && (item.meta.status & MetaStatus.active) !== 0) {
        item.meta.status &= ~MetaStatus.visible
        item.meta.status &= ~MetaStatus.active
        emitter.emit('CollisionResolver:heroDied', entity)
      }
    }
  }

  return {
    resolve: resolve
  }
}

export { createCollisionResolver as default }
