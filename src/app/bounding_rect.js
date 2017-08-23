function BoundingRect(spec) {
  const s = spec || {}
  let x = s.x || 0
  let y = s.y || 0
  let width = s.width || 0
  let height = s.height || 0

  const centerX = function() {
    return this.x + this.width / 2
  }

  const centerY = function() {
    return this.y + this.height / 2
  }

  const maxX = function() {
    return this.x + this.width
  }

  const maxY = function() {
    return this.y + this.height
  }

  const intersects = function(other) {
    return this.x <= other.maxX() &&
      this.maxX() >= other.x &&
      this.y <= other.maxY() &&
      this.maxY() >= other.y
  }

  const contains = function(other) {
    return other.maxX() <= this.maxX() &&
      other.x >= this.x &&
      other.maxY() <= this.maxY() &&
      other.y >= this.y
  }

  const containsPoint = function(pX, pY) {
    return this.x <= pX &&
      this.maxX() >= pX &&
      this.y <= pY &&
      this.maxY() >= pY
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

export { BoundingRect as default }
