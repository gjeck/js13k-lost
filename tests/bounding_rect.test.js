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

  test('it correctly handles non-intersecting rects', () => {
    const boxA = BoundingRect({ x: 0, y: 0, width: 10, height: 10 })
    const boxB = BoundingRect({ x: 10, y: 0, width: 10, height: 10 })
    expect(boxA.intersects(boxB)).toBe(false)
  })
})
