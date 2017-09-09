import { shuffle } from './utils'
import Direction from './direction'

function createMazeGenerator() {
  const generate = (rows, cols, px, py, sparseness) => {
    const x = px || 0
    const y = py || 0
    const s = sparseness || 0.09
    const grid = []

    for (let i = 0; i < rows; ++i) {
      let cells = []
      for (let j = 0; j < cols; ++j) {
        cells.push(0)
      }
      grid.push(cells)
    }

    carve(x, y, grid)

    for (let i = 1; i < rows - 1; ++i) {
      for (let j = 1; j < cols - 1; ++j) {
        if (Math.random() < s) {
          grid[i][j] = Direction.none
        }
      }
    }

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

  return {
    generate: generate
  }
}

export { createMazeGenerator as default }
