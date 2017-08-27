import BoundingRect from './bounding_rect'

function QuadTree(spec) {
  const s = spec || {}
  const maxItems = s.maxItems || 30
  const depth = s.depth || 0
  const bounds = BoundingRect(spec)
  const items = []
  const nodes = []

  const removeAll = () => {
    items.splice(0, items.length)
    nodes.forEach((node) => {
      node.removeAll()
    })
    nodes.splice(0, nodes.length)
  }

  const subDivide = () => {
    const newWidth = Math.floor(bounds.width / 2)
    const newHeight = Math.floor(bounds.height / 2)
    const x = bounds.x
    const y = bounds.y

    const northEastTree = QuadTree({
      depth: depth + 1,
      x: x + newWidth,
      y: y,
      width: newWidth,
      height: newHeight
    })
    nodes.push(northEastTree)
    const northWestTree = QuadTree({
      depth: depth + 1,
      x: x,
      y: y,
      width: newWidth,
      height: newHeight
    })
    nodes.push(northWestTree)
    const southWestTree = QuadTree({
      depth: depth + 1,
      x: x,
      y: y + newHeight,
      width: newWidth,
      height: newHeight
    })
    nodes.push(southWestTree)
    const southEastTree = QuadTree({
      depth: depth + 1,
      x: x + newWidth,
      y: y + newHeight,
      width: newWidth,
      height: newHeight
    })
    nodes.push(southEastTree)
  }

  const insert = (item) => {
    if (!bounds.contains(item.frame)) {
      return false
    }

    if (items.length < maxItems) {
      items.push(item)
      return true
    }

    if (nodes.length === 0) {
      subDivide()
    }

    let addedToChild = false
    nodes.forEach((node) => {
      if (!addedToChild && node.insert(item)) {
        addedToChild = true
      }
    })

    if (addedToChild) {
      return true
    }

    // item is orphaned, and couldn't be added normally
    items.push(item)
    return true
  }

  const query = (boundingRect) => {
    const results = []

    if (!bounds.contains(boundingRect)) {
      return results
    }

    items.forEach((item) => {
      if (item.frame.intersects(boundingRect)) {
        results.push(item)
      }
    })

    nodes.forEach((node) => {
      if (node.bounds.intersects(boundingRect)) {
        const childResults = node.query(boundingRect)
        childResults.forEach((child) => {
          results.push(child)
        })
      }
    })

    return results
  }

  return {
    depth: depth,
    bounds: bounds,
    removeAll: removeAll,
    insert: insert,
    query: query,
    items: items,
    nodes: nodes
  }
}

export { QuadTree as default }
