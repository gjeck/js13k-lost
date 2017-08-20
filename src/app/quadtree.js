import BoundingRect from './bounding_rect'

export default function QuadTree(spec) {
  const s = spec || {}
  const maxItems = s.maxItems || 20
  const depth = s.depth || 0
  const bounds = BoundingRect(spec)
  let items = []
  let nodes = []

  const removeAll = () => {
    items.splice(0, items.length)
    nodes.forEach((node) => {
      node.removeAll()
    })
  }

  const subDivide = () => {
    let newWidth = Math.floor(bounds.width / 2)
    let newHeight = Math.floor(bounds.height / 2)
    let x = bounds.x
    let y = bounds.y

    let northEastTree = QuadTree({
      depth: depth + 1,
      x: x + newWidth,
      y: y,
      width: newWidth,
      height: newHeight
    })
    nodes.push(northEastTree)
    let northWestTree = QuadTree({
      depth: depth + 1,
      x: x,
      y: y,
      width: newWidth,
      height: newHeight
    })
    nodes.push(northWestTree)
    let southWestTree = QuadTree({
      depth: depth + 1,
      x: x,
      y: y + newHeight,
      width: newWidth,
      height: newHeight
    })
    nodes.push(southWestTree)
    let southEastTree = QuadTree({
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

    for (let i = 0; i < nodes.length; ++i) {
      if (nodes[i].insert(item)) {
        return true
      }
    }

    // item is orphaned, and couldn't be added normally
    items.push(item)
    return true
  }

  const query = (boundingRect) => {
    let results = []

    for (let i = 0; i < nodes.length; ++i) {
      if (nodes[i].bounds.intersects(boundingRect)) {
        let childResults = nodes[i].query(boundingRect)
        if (childResults.length) {
          results.push(childResults)
        }
      }
    }

    for (let i = 0; i < items.length; ++i) {
      if (items[i].frame.intersects(boundingRect)) {
        results.push(items[i])
      }
    }

    return results
  }

  return {
    depth: depth,
    bounds: bounds,
    removeAll: removeAll,
    insert: insert,
    query: query
  }
}
