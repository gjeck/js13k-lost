function createGame(spec) {
  const levelFactory = spec.levelFactory
  const emitter = spec.emitter
  const docWindow = spec.docWindow || window
  const levels = []
  const levelsToWin = 3
  let levelCount = 1
  let transitioningLevels = false
  let isGameWon = false

  const currentLevel = () => {
    if (levels.length === 0) {
      addNewLevel(levelCount)
    }
    return levels[0]
  }

  const addNewLevel = () => {
    levels.push(levelFactory.makeLevel(levelCount, levelsToWin))
    levelCount += 1
  }

  const checkWinCondition = () => {
    if (levelCount - 1 > levelsToWin && !isGameWon) {
      win()
      isGameWon = true
    }
    return levelCount - 1 > levelsToWin
  }

  const begin = (timeStamp, frameDelta) => {
    if (checkWinCondition()) {
      return
    }
    currentLevel().begin()
  }

  const update = (delta) => {
    if (checkWinCondition()) {
      return
    }
    currentLevel().update(delta)
  }

  const render = (interpolationPercentage) => {
    if (checkWinCondition()) {
      return
    }
    currentLevel().render(interpolationPercentage)
  }

  const end = (fps, panic) => {
    if (checkWinCondition()) {
      return
    }
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
    levelCount = 1
    transitionLevels()
    isGameWon = false
  }

  const win = () => {
    const event = new Event('Game:won')
    event.message = 'You won!'
    docWindow.dispatchEvent(event)
  }

  emitter.on('Level:heroExited', () => {
    transitionLevels()
  })

  emitter.on('CR:heroDied', () => {
    const event = new Event('Game:lost')
    event.message = 'You died'
    docWindow.dispatchEvent(event)
  })

  docWindow.addEventListener('M:replayBtnPressed', () => {
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
