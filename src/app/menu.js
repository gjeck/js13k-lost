document.addEventListener('DOMContentLoaded', function() {
  const menuContainer = document.getElementById('main-menu')
  const playButton = document.getElementById('play')

  const pauseToggle = () => {
    if (menuContainer.classList.contains('slide-up')) {
      menuContainer.classList.remove('slide-up')
      menuContainer.classList.add('slide-down-from-off-top')
    } else {
      menuContainer.classList.remove('slide-down-from-off-top')
      menuContainer.classList.add('slide-up')
    }
  }

  const playEvent = new Event('Menu:playButtonPressed')
  playButton.addEventListener('click', () => {
    pauseToggle()
    window.dispatchEvent(playEvent)
    playButton.blur()
  })
  window.addEventListener('GameInputController:gamePauseToggled', pauseToggle)
})
