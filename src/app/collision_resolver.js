function CollisionResolver() {
  const resolve = (entity, collection) => {
    collection.forEach((item) => {
      if (entity.frame === item) {
        return
      }
      let bottomCollision = entity.frame.maxY() - item.frame.y
      let topCollision = item.frame.maxY() - entity.frame.y
      let leftCollision = item.frame.maxX() - entity.frame.x
      let rightCollision = entity.frame.maxX() - item.frame.x
      if (topCollision < bottomCollision &&
        topCollision < leftCollision &&
        topCollision < rightCollision) {
        entity.frame.y = item.frame.maxY()
      } else if (bottomCollision < topCollision &&
        bottomCollision < leftCollision &&
         bottomCollision < rightCollision) {
        entity.frame.y = item.frame.y - entity.frame.maxY() + entity.frame.y
      } else if (leftCollision < rightCollision &&
         leftCollision < topCollision &&
         leftCollision < bottomCollision) {
        entity.frame.x = item.frame.maxX()
      } else if (rightCollision < leftCollision &&
        rightCollision < topCollision &&
         rightCollision < bottomCollision) {
        entity.frame.x = item.frame.x - entity.frame.maxX() + entity.frame.x
      }
    })
  }

  return {
    resolve: resolve
  }
}

export { CollisionResolver as default }
