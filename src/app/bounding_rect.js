export default function BoundingRect(spec) {
  const s = spec || {}
  let x = s.x || 0
  let y = s.y || 0
  let width = s.width || 0
  let height = s.height || 0

  const centerX = () => {
    return x + width / 2
  }

  const centerY = () => {
    return y + height / 2
  }

  const maxX = () => {
    return x + width
  }

  const maxY = () => {
    return y + height
  }

  const intersects = (other) => {
    return x <= other.maxX() &&
      maxX() >= other.x &&
      y <= other.maxY() &&
      maxY() >= other.y
  }

  const contains = (other) => {
    return other.maxX() <= maxX() &&
      other.x >= x &&
      other.maxY() <= maxY() &&
      other.y >= y
  }

  const containsPoint = (pX, pY) => {
    return x <= pX &&
      maxX() >= pX &&
      y <= pY &&
      maxY() >= pY
  }

  return {
    x: x,
    y: y,
    width: width,
    height: height,
    centerX: centerX,
    centerY: centerY,
    maxX: maxX,
    maxY: maxY,
    intersects: intersects,
    contains: contains,
    containsPoint: containsPoint
  }
}
