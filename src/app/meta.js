const MetaType = Object.freeze({
  none: 0,
  hero: 1,
  wall: 2,
  arrow: 3,
  enemy: 4
})

const MetaStatus = Object.freeze({
  active: 2,
  visible: 4,
  invulnerable: 8
})

function createMeta(spec) {
  const s = spec || {}
  const type = s.type || MetaType.none
  let health = s.health || 0
  let damage = s.damage || 0
  let status = s.status || MetaStatus.active | MetaStatus.visible
  return {
    type: type,
    health: health,
    damage: damage,
    status: status
  }
}

export {
  createMeta,
  MetaType,
  MetaStatus
}
