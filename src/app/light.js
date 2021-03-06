function createLight(spec) {
  const s = spec || {}
  const target = s.target
  const graphics = s.graphics
  const map = s.map
  const intersects = []

  const getIntersection = (point, segment) => {
    const rPx = point.x
    const rPy = point.y
    const rDx = point.x - target.frame.centerX()
    const rDy = point.y - target.frame.centerY()

    const sPx = segment.x1
    const sPy = segment.y1
    const sDx = segment.x2 - segment.x1
    const sDy = segment.y2 - segment.y1

    if (rDx * sDy === rDy * sDx) { // parallel
      return null
    }

    const denom = sDx * rDy - sDy * rDx
    if (denom === 0) {
      return null
    }

    const t2 = (rDx * (sPy - rPy) + rDy * (rPx - sPx)) / denom
    const t1 = rDx === 0 ? (sPy + sDy * t2 - rPy) / rDy : (sPx + sDx * t2 - rPx) / rDx

    if (t1 < 0 || t2 < 0 || t2 > 1) {
      return null
    }

    return {
      x: rPx + rDx * t1,
      y: rPy + rDy * t1,
      t1: t1
    }
  }

  const calculateIntersections = (viewport) => {
    intersects.splice(0, intersects.length)

    const segments = []
    const bounds = map.rowsAndColsInViewport(viewport)
    segments.push({ x1: viewport.left, x2: viewport.right, y1: viewport.top, y2: viewport.top })
    segments.push({ x1: viewport.left, x2: viewport.left, y1: viewport.top, y2: viewport.bottom })
    segments.push({ x1: viewport.right, x2: viewport.right, y1: viewport.top, y2: viewport.bottom })
    segments.push({ x1: viewport.left, x2: viewport.right, y1: viewport.bottom, y2: viewport.bottom })
    for (let i = bounds.minRow; i <= bounds.maxRow; ++i) {
      for (let j = bounds.minCol; j <= bounds.maxCol; ++j) {
        const lines = map.linesAt(i, j)
        lines.forEach((line) => {
          segments.push(line)
        })
      }
    }

    const uniqueAngles = (function(lines) {
      const set = {}
      const angles = []
      lines.forEach((line) => {
        const keyA = `${line.x1},${line.y1}`
        const keyB = `${line.x2},${line.y2}`
        if (!set[keyA]) {
          set[keyA] = true
          const angle = Math.atan2(line.y1 - target.frame.centerY(), line.x1 - target.frame.centerX())
          angles.push(angle - 0.00001, angle, angle + 0.00001)
        }
        if (!set[keyB]) {
          set[keyB] = true
          const angle = Math.atan2(line.y2 - target.frame.centerY(), line.x2 - target.frame.centerX())
          angles.push(angle - 0.00001, angle, angle + 0.00001)
        }
      })
      return angles
    })(segments)

    uniqueAngles.forEach((angle) => {
      const point = {
        x: target.frame.centerX() + Math.cos(angle),
        y: target.frame.centerY() + Math.sin(angle)
      }

      let closest = { t1: Infinity }
      segments.forEach((segment) => {
        const intersection = getIntersection(point, segment)
        if (intersection && intersection.t1 < closest.t1) {
          closest = intersection
        }
      })
      if (closest !== Infinity) {
        closest.angle = angle
        intersects.push(closest)
      }
    })

    intersects.sort((a, b) => {
      return a.angle - b.angle
    })
  }

  const render = () => {
    graphics.ctx.save()
    graphics.ctx.fillStyle = '#FCD422'
    graphics.ctx.globalCompositeOperation = 'destination-atop'
    graphics.ctx.globalAlpha = 1.0
    graphics.ctx.beginPath()
    intersects.forEach((item, index) => {
      if (!index) {
        graphics.ctx.moveTo(item.x, item.y)
      } else {
        graphics.ctx.lineTo(item.x, item.y)
      }
    })
    graphics.ctx.closePath()
    graphics.ctx.fill()
    graphics.ctx.restore()
  }

  return {
    calculateIntersections: calculateIntersections,
    render: render
  }
}

export { createLight as default }
