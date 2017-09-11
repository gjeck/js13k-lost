function createGame(spec) {
  const levelFactory = spec.levelFactory
  const emitter = spec.emitter
  const docWindow = spec.docWindow || window
  const levels = []
  let levelCount = 0
  let transitioningLevels = false

  const currentLevel = () => {
    if (levels.length === 0) {
      addNewLevel(levelCount)
    }
    return levels[0]
  }

  const addNewLevel = () => {
    levels.push(levelFactory.makeLevel(levelCount))
    levelCount += 1
  }

  const begin = (timeStamp, frameDelta) => {
    currentLevel().begin()
  }

  const update = (delta) => {
    currentLevel().update(delta)
  }

  const render = (interpolationPercentage) => {
    currentLevel().render(interpolationPercentage)
  }

  const end = (fps, panic) => {
    currentLevel().end(fps, panic)
  }

  const transitionLevels = () => {
    if (transitioningLevels) {
      return
    }
    transitioningLevels = true
    currentLevel().complete(() => {
      levels.pop()
      addNewLevel(levelCount)
      currentLevel().start()
      transitioningLevels = false
    })
  }

  const reset = () => {
    levelCount = 0
    transitionLevels()
  }

  emitter.on('Level:heroExited', () => {
    transitionLevels()
  })

  emitter.on('CollisionResolver:heroDied', () => {
    const event = new Event('Game:lost')
    docWindow.dispatchEvent(event)
  })

  docWindow.addEventListener('Menu:replayButtonPressed', () => {
    reset()
  })

  return {
    begin: begin,
    update: update,
    render: render,
    end: end
  }
}

export { createGame as default }
