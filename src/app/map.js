import Direction from './direction'
import createBoundingRect from './bounding_rect'
import { randomIntInRange } from './utils'
import { Meta, MetaType } from './meta'

function Map(spec) {
  const s = spec || {}
  const graphics = s.graphics
  const maze = s.maze
  const cols = maze[0].length
  const rows = maze.length
  const tileSize = s.tileSize || 200
  const exit = s.exit || { row: randomIntInRange(0, rows), col: cols - 1 }

  maze[exit.row][exit.col] = 0

  const wallDimension = () => {
    return Math.ceil(tileSize / 8)
  }

  const getTileRects = (row, col) => {
    const x = tileSize * col
    const y = tileSize * row
    const tileNum = maze[row][col]
    const edgeDimension = wallDimension()
    const halfEdge = Math.ceil(edgeDimension / 2)
    const rects = []

    if (tileNum === 0) {
      return rects
    }
    if ((tileNum & Direction.n) === 0) {
      rects.push({
        x: x,
        y: y - halfEdge,
        width: tileSize,
        height: edgeDimension
      })
    }
    if ((tileNum & Direction.s) === 0) {
      rects.push({
        x: x,
        y: y + tileSize - halfEdge,
        width: tileSize,
        height: edgeDimension
      })
    }
    if ((tileNum & Direction.e) === 0) {
      rects.push({
        x: x + tileSize - halfEdge,
        y: y - halfEdge,
        width: edgeDimension,
        height: tileSize + edgeDimension
      })
    }
    if ((tileNum & Direction.w) === 0) {
      rects.push({
        x: x - halfEdge,
        y: y - halfEdge,
        width: edgeDimension,
        height: tileSize + edgeDimension
      })
    }
    return rects
  }

  const tileRectCache = (function() {
    const w = {}
    for (let row = 0; row < rows; ++row) {
      for (let col = 0; col < cols; ++col) {
        w[`${row},${col}`] = getTileRects(row, col)
      }
    }
    return w
  }())

  const walls = (function() {
    return Object.keys(tileRectCache)
      .reduce((acc, next) => {
        const rects = tileRectCache[next]
        rects.forEach((rect) => acc.push(Wall(rect)))
        return acc
      }, [])
  }())

  const tileLineCache = (function() {
    const l = {}
    for (let row = 0; row < rows; ++row) {
      for (let col = 0; col < cols; ++col) {
        const items = tileRectCache[`${row},${col}`]
        l[`${row},${col}`] = []
        items.forEach((item) => {
          const top = { x1: item.x, x2: item.x + item.width, y1: item.y, y2: item.y }
          const left = { x1: item.x, x2: item.x, y1: item.y, y2: item.y + item.height }
          const right = { x1: item.x + item.width, x2: item.x + item.width, y1: item.y, y2: item.y + item.height }
          const bottom = { x1: item.x, x2: item.x + item.width, y1: item.y + item.height, y2: item.y + item.height }
          l[`${row},${col}`] = l[`${row},${col}`].concat([top, left, right, bottom])
        })
      }
    }
    return l
  }())

  const linesAt = (row, col) => {
    return tileLineCache[`${row},${col}`]
  }

  const rowsAndColsInViewport = (viewport) => {
    return {
      minRow: Math.max(Math.floor(viewport.top / tileSize), 0),
      maxRow: Math.min(Math.floor(viewport.bottom / tileSize), rows - 1),
      minCol: Math.max(Math.floor(viewport.left / tileSize), 0),
      maxCol: Math.min(Math.floor(viewport.right / tileSize), cols - 1)
    }
  }

  const render = (viewport) => {
    const minRow = Math.max(Math.floor(viewport.top / tileSize), 0)
    const maxRow = Math.min(Math.floor(viewport.bottom / tileSize), rows - 1)
    const minCol = Math.max(Math.floor(viewport.left / tileSize), 0)
    const maxCol = Math.min(Math.floor(viewport.right / tileSize), cols - 1)

    for (let row = minRow; row <= maxRow; ++row) {
      for (let col = minCol; col <= maxCol; ++col) {
        drawTile(row, col)
      }
    }
  }

  const drawTile = (row, col) => {
    graphics.ctx.save()
    graphics.ctx.fillStyle = 'black'
    const rects = tileRectCache[`${row},${col}`]
    rects.forEach((rect) => {
      graphics.drawRect(rect.x, rect.y, rect.width, rect.height)
    })
    graphics.ctx.restore()
  }

  return {
    cols: cols,
    rows: rows,
    tileSize: tileSize,
    render: render,
    wallDimension: wallDimension,
    walls: walls,
    linesAt: linesAt,
    rowsAndColsInViewport: rowsAndColsInViewport
  }
}

function Wall(spec) {
  const s = spec || {}
  s.type = s.type || MetaType.wall
  const frame = createBoundingRect(s)
  const meta = Meta(s)

  return {
    frame: frame,
    meta: meta
  }
}

export { Map as default }
