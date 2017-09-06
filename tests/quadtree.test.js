import QuadTree from '../src/app/quadtree'
import createBoundingRect from '../src/app/bounding_rect'

describe('a quadtree', () => {
  let quadtree
  beforeEach(() => {
    quadtree = QuadTree({
      maxItems: 4,
      x: 0,
      y: 0,
      width: 100,
      height: 100
    })
  })

  test('it does not add items outside its bounds', () => {
    const mockItem = MockItem({ x: -50, y: -50, width: 10, height: 10 })
    expect(quadtree.insert(mockItem)).toBe(false)
  })

  test('it does add items within its bounds', () => {
    const mockItem = MockItem({ x: 1, y: 1, width: 1, height: 1 })
    expect(quadtree.insert(mockItem)).toBe(true)
  })

  test('it can query and find items in the case where it has not subdivided', () => {
    const mockItemA = MockItem({ x: 1, y: 1, width: 1, height: 1 })
    quadtree.insert(mockItemA)

    const mockItemB = MockItem({ x: 6, y: 6, width: 4, height: 4 })
    quadtree.insert(mockItemB)

    const rect = createBoundingRect({ x: 0, y: 0, width: 5, height: 5 })
    const results = quadtree.query(rect)
    expect(results.length).toBe(1)
    expect(results[0] === mockItemA).toBe(true)
  })

  test('it can query and find items in the case where it has subdivided', () => {
    const mockItemA = MockItem({ x: 1, y: 1, width: 1, height: 1 })
    quadtree.insert(mockItemA)

    const mockItemB = MockItem({ x: 6, y: 6, width: 4, height: 10 })
    quadtree.insert(mockItemB)

    const mockItemC = MockItem({ x: 2, y: 2, width: 9, height: 4 })
    quadtree.insert(mockItemC)

    const mockItemD = MockItem({ x: 70, y: 55, width: 4, height: 4 })
    quadtree.insert(mockItemD)

    const mockItemE = MockItem({ x: 70, y: 55, width: 4, height: 4 })
    quadtree.insert(mockItemE)

    const rect = createBoundingRect({ x: 0, y: 0, width: 25, height: 25 })
    const results = quadtree.query(rect)
    expect(results.length).toBe(3)

    const expected = [mockItemA, mockItemB, mockItemC]
    expect(results).toEqual(expect.arrayContaining(expected))
  })
})

function MockItem(spec) {
  let frame = createBoundingRect(spec)
  return {
    frame: frame
  }
}
