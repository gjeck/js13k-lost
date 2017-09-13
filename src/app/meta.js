const MetaType = Object.freeze({
  none: 0,
  hero: 1,
  wall: 2,
  arrow: 3,
  enemy: 4,
  enemyArrow: 5
})

const MetaStatus = Object.freeze({
  none: 0,
  active: 1,
  visible: 2,
  invulnerable: 4
})

function Meta(type, health, damage, status) {
  this.type = type
  this.health = health
  this.totalHealth = health
  this.damage = damage
  this.status = status
}

function createMeta(spec) {
  const s = spec || {}
  const type = s.type || MetaType.none
  let health = s.health || 0
  let damage = s.damage || 0
  let status = s.status === undefined ? (MetaStatus.active | MetaStatus.visible) : MetaStatus.none
  return new Meta(type, health, damage, status)
}

export {
  createMeta,
  MetaType,
  MetaStatus
}
