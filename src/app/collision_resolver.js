export default function CollisionResolver() {
  const resolve = (frame, collection) => {
    collection.forEach((item) => {
      if (frame === item) {
        return
      }
      let bottomCollision = frame.maxY() - item.frame.y
      let topCollision = item.frame.maxY() - frame.y
      let leftCollision = item.frame.maxX() - frame.x
      let rightCollision = frame.maxX() - item.frame.x
      if (topCollision < bottomCollision &&
        topCollision < leftCollision &&
        topCollision < rightCollision) {
        frame.y = item.frame.maxY()
      } else if (bottomCollision < topCollision &&
        bottomCollision < leftCollision &&
         bottomCollision < rightCollision) {
        frame.y = item.frame.y - frame.maxY() + frame.y
      } else if (leftCollision < rightCollision &&
         leftCollision < topCollision &&
         leftCollision < bottomCollision) {
        frame.x = item.frame.maxX()
      } else if (rightCollision < leftCollision &&
        rightCollision < topCollision &&
         rightCollision < bottomCollision) {
        frame.x = item.frame.x - frame.maxX() + frame.x
      }
    })
  }

  return {
    resolve: resolve
  }
}
