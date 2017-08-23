import { Direction } from './maze'
import BoundingRect from './bounding_rect'
import { randomIntInRange } from './utils'

function Map(spec) {
  const s = spec || {}
  const graphics = s.graphics
  const maze = s.maze
  const cols = maze[0].length
  const rows = maze.length
  const tileSize = s.tileSize || 200
  const exit = s.exit || {row: randomIntInRange(0, rows), col: cols - 1}

  maze[exit.row][exit.col] = 0

  const getAllWalls = () => {
    let rects = []
    for (let row = 0; row < rows; ++row) {
      for (let col = 0; col < cols; ++col) {
        let tileRects = getTileRects(row, col)
        tileRects.forEach((rect) => {
          rects.push(Wall(rect))
        })
      }
    }
    return rects
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
    let x = tileSize * col
    let y = tileSize * row
    let tileNum = maze[row][col]
    let edgeDimension = tileSize / 8
    let halfEdge = edgeDimension / 2
    let rects = []

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

  const drawTile = (row, col) => {
    graphics.ctx.save()
    graphics.ctx.fillStyle = 'black'
    let rects = getTileRects(row, col)
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
    getAllWalls: getAllWalls
  }
}

function Wall(spec) {
  const s = spec || {}
  let frame = BoundingRect(s)

  return {
    frame: frame
  }
}

export { Map as default }
