import Direction from './direction'
import { randomIntInRange } from './utils'

function RandomMovementBehavior(spec) {
  const s = spec || {}
  const frame = s.frame
  const targetFrame = s.targetFrame
  let speed = s.speed || 0.31
  const lastPosition = { x: frame.x, y: frame.y }
  const targetVector = { x: targetFrame.centerX(), y: targetFrame.centerY() }
  let direction = s.direction || Direction.none
  let randomness = s.randomness || 0.04
  let actionDistance = s.actionDistance || 250

  const update = (delta) => {
    targetVector.x = targetFrame.centerX() - frame.centerX()
    targetVector.y = targetFrame.centerY() - frame.centerY()
    const hypotenuse = Math.hypot(targetVector.x, targetVector.y)
    if (hypotenuse < actionDistance) {
      targetVector.x /= hypotenuse
      targetVector.y /= hypotenuse
      frame.x += targetVector.x * speed * delta
      frame.y += targetVector.y * speed * delta
    } else {
      doRandomWalk(delta)
    }

    if (frame.x === lastPosition.x && frame.y === lastPosition.y) {
      direction = getRandomDirection()
    }
    lastPosition.x = frame.x
    lastPosition.y = frame.y
  }

  const doRandomWalk = (delta) => {
    if (direction === Direction.none) {
      direction = getRandomDirection()
    }

    if ((direction & Direction.n) !== 0) {
      frame.y -= delta * speed
    } else if ((direction & Direction.s) !== 0) {
      frame.y += delta * speed
    }
    if ((direction & Direction.e) !== 0) {
      frame.x += delta * speed
    } else if ((direction & Direction.w) !== 0) {
      frame.x -= delta * speed
    }

    if (Math.random() < randomness) {
      direction |= getRandomDirection()
    }
  }

  const getRandomDirection = () => {
    return Direction[Direction.dirs[randomIntInRange(0, Direction.dirs.length)]]
  }

  return {
    update: update
  }
}

export { RandomMovementBehavior }
