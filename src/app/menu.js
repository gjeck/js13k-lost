document.addEventListener('DOMContentLoaded', function() {
  const mainMenu = document.getElementById('main-menu')
  const pauseToggle = () => {
    if (mainMenu.classList.contains('slide-up')) {
      mainMenu.classList.remove('slide-up')
      mainMenu.classList.add('slide-down-from-off-top')
    } else {
      mainMenu.classList.remove('slide-down-from-off-top')
      mainMenu.classList.add('slide-up')
    }
  }

  const playEvent = new Event('Menu:playButtonPressed')
  const playButton = document.getElementById('play')
  playButton.addEventListener('click', () => {
    pauseToggle()
    window.dispatchEvent(playEvent)
    playButton.blur()
  })
  window.addEventListener('GameInputController:gamePauseToggled', pauseToggle)

  const replayPopup = document.getElementById('replay-popup')
  const replayToggle = () => {
    if (replayPopup.classList.contains('hide')) {
      replayPopup.classList.remove('hide')
      replayPopup.classList.toggle('fade-in')
    } else {
      replayPopup.classList.toggle('fade-in')
      replayPopup.classList.toggle('fade-out')
    }
  }

  const replayEvent = new Event('Menu:replayButtonPressed')
  const replayButton = document.getElementById('replay')
  replayButton.addEventListener('click', () => {
    replayToggle()
    window.dispatchEvent(replayEvent)
    replayButton.blur()
  })
  window.addEventListener('Game:lost', replayToggle)
})
