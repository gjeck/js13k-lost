import { shuffle } from './utils'

function MazeGenerator() {
  const generate = (rows, cols, px, py) => {
    let x = px || 0
    let y = py || 0
    let grid = []
    for (let i = 0; i < rows; ++i) {
      let cells = []
      for (let j = 0; j < cols; ++j) {
        cells.push(0)
      }
      grid.push(cells)
    }
    carve(x, y, grid)
    return grid
  }

  const carve = (cx, cy, grid) => {
    const directions = shuffle(Direction.dirs)
    directions.forEach((direction) => {
      const nx = cx + Direction.dx[direction]
      const ny = cy + Direction.dy[direction]
      const isValid = ny >= 0 &&
        ny < grid.length &&
        nx >= 0 &&
        nx < grid[ny].length &&
        grid[ny][nx] === 0
      if (isValid) {
        grid[cy][cx] |= Direction[direction]
        grid[ny][nx] |= Direction.opposite[direction]
        carve(nx, ny, grid)
      }
    })
  }

  const asString = (grid) => {
    let s = ' '
    for (let i = 0; i < grid.length * 2 - 1; ++i) {
      s += '_'
    }
    s += '\n'
    for (let y = 0; y < grid.length; ++y) {
      s += '|'
      for (let x = 0; x < grid.length; ++x) {
        s += ((grid[y][x] & Direction.s) !== 0) ? ' ' : '_'
        if ((grid[y][x] & Direction.e) !== 0) {
          s += (((grid[y][x] | grid[y][x + 1]) & Direction.s) !== 0) ? ' ' : '_'
        } else {
          s += '|'
        }
      }
      s += '\n'
    }
    return s
  }

  return {
    generate: generate,
    asString: asString
  }
}

const Direction = Object.freeze({
  n: 1,
  s: 2,
  e: 4,
  w: 8,
  dirs: ['n', 's', 'e', 'w'],
  dx: { e: 1, w: -1, n: 0, s: 0 },
  dy: { e: 0, w: 0, n: -1, s: 1 },
  opposite: { e: 8, w: 4, n: 2, s: 1 }
})

export {
  MazeGenerator as default,
  Direction
}
