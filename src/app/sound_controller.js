/* eslint-disable no-sparse-arrays */
/* eslint-disable comma-spacing */
import jsfxr from 'jsfxr'
import { randomIntInRange } from './utils'

function SoundController(muted) {
  this.muted = muted
}

SoundController.prototype.play = function(sound) {
  if (this.muted) {
    return
  }
  const player = new Audio()
  player.src = sound
  player.play()
}

function createSoundController(spec) {
  const soundController = new SoundController(false)
  const emitter = spec.emitter
  let soundThrottleTimeoutId = null

  emitter.on('Hero:onMouseDown', (ammunition) => {
    if (ammunition.length) {
      soundController.play(Sounds.hero.fire[randomIntInRange(0, Sounds.hero.fire.length)])
    } else {
      soundController.play(Sounds.hero.fireEmpty[randomIntInRange(0, Sounds.hero.fireEmpty.length)])
    }
  })

  emitter.on('Hero:isDashing', () => {
    soundController.play(Sounds.hero.dash[randomIntInRange(0, Sounds.hero.dash.length)])
  })

  emitter.on('CollisionResolver:heroTouchedProjectile', () => {
    soundController.play(Sounds.hero.pickup[randomIntInRange(0, Sounds.hero.pickup.length)])
  })

  emitter.on('CollisionResolver:heroTouchedEnemy', () => {
    if (soundThrottleTimeoutId) {
      return
    }
    soundThrottleTimeoutId = setTimeout(() => {
      soundController.play(Sounds.hero.hurt[randomIntInRange(0, Sounds.hero.hurt.length)])
      soundThrottleTimeoutId = null
    }, 300)
  })

  emitter.on('CollisionResolver:enemyDied', () => {
    soundController.play(Sounds.enemy.died[randomIntInRange(0, Sounds.enemy.died.length)])
  })

  emitter.on('CollisionResolver:heroDied', () => {
    soundController.play(Sounds.hero.died)
  })

  emitter.on('Enemy:didFire', () => {
    soundController.play(Sounds.enemy.fire)
  })

  return soundController
}

const Sounds = Object.freeze({
  hero: {
    fire: [
      jsfxr([2,,0.138,0.2833,0.3363,0.8296,0.3507,-0.3135,,,,,,0.3683,0.0045,,,,1,,,0.1446,,0.5]),
      jsfxr([2,,0.1096,0.2833,0.3363,0.8697,0.3609,-0.2655,-0.0371,,0.0505,-0.0091,,0.3119,0.0139,0.0224,,-0.0162,1,,0.0403,0.1926,0.0421,0.5]),
      jsfxr([2,,0.1251,0.2802,0.3448,0.8455,0.3976,-0.3491,0.0315,,0.0088,,,0.2863,0.0009,,-0.0659,0.0129,0.9717,0.0212,0.0236,0.1267,-0.0284,0.5])
    ],
    fireEmpty: [
      jsfxr([3,,0.0451,,0.287,0.3837,,-0.5973,,,,,,,,,,,1,,,0.0039,,0.44]),
      jsfxr([3,,0.0451,0.0344,0.2436,0.3837,,-0.5575,0.0192,,,,,,0.043,,0.0443,,0.9888,0.0214,,0.0213,0.013,0.31])
    ],
    dash: [
      jsfxr([0,,0.3845,,0.2544,0.543,,0.1433,,,,,,0.3354,,,,,0.6125,,,,,0.35]),
      jsfxr([0,,0.4298,,0.311,0.6176,0.018,0.1433,0.0482,,,0.0041,0.0496,0.3003,0.0458,,0.04,0.007,0.6125,,0.0008,0.0115,-0.0065,0.35])
    ],
    pickup: [
      jsfxr([0,,0.0101,0.5708,0.2528,0.5521,,,,,,0.3545,0.5621,,,,,,1,,,,,0.5]),
      jsfxr([0,0.0074,0.01,0.6028,0.2642,0.5521,0.038,,-0.0054,,,0.3896,0.5173,0.0287,-0.0159,0.0239,,-0.0176,0.9738,,,0.036,0.0484,0.5])
    ],
    hurt: [
      jsfxr([3,,0.1216,0.4737,0.3359,0.0444,,0.0488,,,,,,,,,0.102,-0.1476,1,,,,,0.35]),
      jsfxr([3,,0.1114,0.4446,0.3265,0.0391,,0.0088,-0.03,,,0.0264,,,-0.0284,0.0162,0.102,-0.1667,1,,0.0309,0.0422,0.0105,0.35])
    ],
    died: jsfxr([3,,0.2485,0.5029,0.4305,0.2722,,-0.2421,,,,,,,,0.449,,,1,,,,,0.5])
  },
  enemy: {
    died: [
      jsfxr([0,0.0355,0.0514,,0.1975,0.2944,,-0.2884,0.0285,,,,,0.3462,-0.0323,,-0.0342,-0.0466,0.9699,-0.0228,,,0.0472,0.5]),
      jsfxr([0,,0.0778,,0.1975,0.2944,0.0156,-0.2884,0.0285,,,,,0.3293,-0.0323,,-0.0378,-0.0848,0.9699,-0.0104,0.0358,,0.0814,0.5])
    ],
    fire: jsfxr([2,,0.132,0.1027,0.1289,0.4003,0.015,-0.369,,,,,,0.6463,-0.323,,,,1,,,0.1872,,0.5])
  }
})

export {
  createSoundController as default,
  Sounds
}
