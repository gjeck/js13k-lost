import Direction from './direction'
import BoundingRect from './bounding_rect'
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
    return tileSize / 8
  }

  const render = (viewport) => {
    let minRow = Math.max(Math.floor(viewport.top / tileSize), 0)
    let maxRow = Math.min(Math.floor(viewport.bottom / tileSize), rows - 1)
    let minCol = Math.max(Math.floor(viewport.left / tileSize), 0)
    let maxCol = Math.min(Math.floor(viewport.right / tileSize), cols - 1)

    for (let row = minRow; row <= maxRow; ++row) {
      for (let col = minCol; col <= maxCol; ++col) {
        drawTile(row, col)
      }
    }
  }

  const getTileRects = (row, col) => {
    const x = tileSize * col
    const y = tileSize * row
    const tileNum = maze[row][col]
    const edgeDimension = wallDimension()
    const halfEdge = edgeDimension / 2
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

  const tileCache = (function() {
    const w = {}
    for (let row = 0; row < rows; ++row) {
      for (let col = 0; col < cols; ++col) {
        w[`${row},${col}`] = getTileRects(row, col)
      }
    }
    return w
  }())

  const walls = (function() {
    return Object.keys(tileCache)
      .reduce((acc, next) => {
        const rects = tileCache[next]
        rects.forEach((rect) => acc.push(Wall(rect)))
        return acc
      }, [])
  }())

  const drawTile = (row, col) => {
    graphics.ctx.save()
    graphics.ctx.fillStyle = 'black'
    const rects = tileCache[`${row},${col}`]
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
    walls: walls
  }
}

function Wall(spec) {
  const s = spec || {}
  s.type = s.type || MetaType.wall
  const frame = BoundingRect(s)
  const meta = Meta(s)

  return {
    frame: frame,
    meta: meta
  }
}

export { Map as default }
