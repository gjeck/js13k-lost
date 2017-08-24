import BoundingRect from '../src/app/bounding_rect'

describe('bounding rects', () => {
  test('it can intersect with overlapping rects', () => {
    const boxA = BoundingRect({ x: 0, y: 0, width: 10, height: 10 })
    const boxB = BoundingRect({ x: 9, y: 9, width: 5, height: 5 })
    expect(boxA.intersects(boxB)).toBe(true)
  })

  test('it can intersect with enveloped rects', () => {
    const boxA = BoundingRect({ x: 0, y: 0, width: 10, height: 10 })
    const boxB = BoundingRect({ x: 3, y: 3, width: 2, height: 2 })
    expect(boxA.intersects(boxB)).toBe(true)
  })

  test('it can intersect touching rects', () => {
    const boxA = BoundingRect({ x: 0, y: 0, width: 10, height: 10 })
    const boxB = BoundingRect({ x: 10, y: 0, width: 10, height: 10 })
    expect(boxA.intersects(boxB)).toBe(true)
  })

  test('it correctly handles non-intersecting rects', () => {
    const boxA = BoundingRect({ x: 0, y: 0, width: 10, height: 10 })
    const boxB = BoundingRect({ x: 11, y: 0, width: 10, height: 10 })
    expect(boxA.intersects(boxB)).toBe(false)
  })

  test('it correctly determines if a point is contained inside', () => {
    const box = BoundingRect({ x: 0, y: 0, width: 10, height: 10 })
    expect(box.containsPoint(0, 0)).toBe(true)
    expect(box.containsPoint(5, 5)).toBe(true)
    expect(box.containsPoint(10, 10)).toBe(true)
    expect(box.containsPoint(-1, 5)).toBe(false)
    expect(box.containsPoint(100, 100)).toBe(false)
  })

  test('it can center to another rect', () => {
    const boxA = BoundingRect({ x: 0, y: 0, width: 8, height: 8 })
    const boxB = BoundingRect({ x: 0, y: 0, width: 4, height: 4 })
    boxB.centerTo(boxA)
    expect(boxB.centerX()).toEqual(boxA.centerX())
    expect(boxB.centerY()).toEqual(boxA.centerY())
  })
})
