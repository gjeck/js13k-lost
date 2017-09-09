import createBoundingRect from './bounding_rect'

function QuadTree(maxItems, depth, bounds) {
  this.maxItems = maxItems
  this.depth = depth
  this.bounds = bounds
  this.items = []
  this.nodes = []
}

QuadTree.prototype.removeAll = function() {
  this.items.splice(0, this.items.length)
  this.nodes.forEach((node) => {
    node.removeAll()
  })
  this.nodes.splice(0, this.nodes.length)
}

QuadTree.prototype.subDivide = function() {
  const newWidth = Math.floor(this.bounds.width / 2)
  const newHeight = Math.floor(this.bounds.height / 2)
  const x = this.bounds.x
  const y = this.bounds.y

  const northEastTree = createQuadTree({
    depth: this.depth + 1,
    x: x + newWidth,
    y: y,
    width: newWidth,
    height: newHeight
  })
  this.nodes.push(northEastTree)
  const northWestTree = createQuadTree({
    depth: this.depth + 1,
    x: x,
    y: y,
    width: newWidth,
    height: newHeight
  })
  this.nodes.push(northWestTree)
  const southWestTree = createQuadTree({
    depth: this.depth + 1,
    x: x,
    y: y + newHeight,
    width: newWidth,
    height: newHeight
  })
  this.nodes.push(southWestTree)
  const southEastTree = createQuadTree({
    depth: this.depth + 1,
    x: x + newWidth,
    y: y + newHeight,
    width: newWidth,
    height: newHeight
  })
  this.nodes.push(southEastTree)
}

QuadTree.prototype.insert = function(item) {
  if (!this.bounds.contains(item.frame)) {
    return false
  }

  if (this.items.length < this.maxItems) {
    this.items.push(item)
    return true
  }

  if (this.nodes.length === 0) {
    this.subDivide()
  }

  let addedToChild = false
  this.nodes.forEach((node) => {
    if (!addedToChild && node.insert(item)) {
      addedToChild = true
    }
  })

  if (addedToChild) {
    return true
  }

  // item is orphaned, and couldn't be added normally
  this.items.push(item)
  return true
}

QuadTree.prototype.query = function(boundingRect) {
  const results = []

  if (!this.bounds.contains(boundingRect)) {
    return results
  }

  this.items.forEach((item) => {
    if (item.frame.intersects(boundingRect)) {
      results.push(item)
    }
  })

  this.nodes.forEach((node) => {
    if (node.bounds.intersects(boundingRect)) {
      const childResults = node.query(boundingRect)
      childResults.forEach((child) => {
        results.push(child)
      })
    }
  })

  return results
}

function createQuadTree(spec) {
  const s = spec || {}
  const maxItems = s.maxItems || 30
  const depth = s.depth || 0
  const bounds = s.bounds || createBoundingRect(s)

  return new QuadTree(maxItems, depth, bounds)
}

export {
  createQuadTree as default,
  QuadTree
}
