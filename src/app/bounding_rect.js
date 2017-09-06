function Rect(x, y, width, height) {
  this.x = x
  this.y = y
  this.width = width
  this.height = height
}

Rect.prototype.centerX = function() {
  return this.x + this.width / 2
}

Rect.prototype.centerY = function() {
  return this.y + this.height / 2
}

Rect.prototype.maxX = function() {
  return this.x + this.width
}

Rect.prototype.maxY = function() {
  return this.y + this.height
}

Rect.prototype.intersects = function(other) {
  return this.x <= other.maxX() &&
    this.maxX() >= other.x &&
    this.y <= other.maxY() &&
    this.maxY() >= other.y
}

Rect.prototype.contains = function(other) {
  return other.maxX() <= this.maxX() &&
    other.x >= this.x &&
    other.maxY() <= this.maxY() &&
    other.y >= this.y
}

Rect.prototype.containsPoint = function(pX, pY) {
  return this.x <= pX &&
    this.maxX() >= pX &&
    this.y <= pY &&
    this.maxY() >= pY
}

Rect.prototype.centerTo = function(other) {
  this.x = other.x + ((other.width - this.width) / 2)
  this.y = other.y + ((other.height - this.height) / 2)
  return this
}

function createBoundingRect(spec) {
  const s = spec || {}
  let x = s.x || 0
  let y = s.y || 0
  let width = s.width || 0
  let height = s.height || 0

  return new Rect(x, y, width, height)
}

export {
  createBoundingRect as default,
  Rect
}
