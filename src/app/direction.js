const Direction = Object.freeze({
  none: 0,
  n: 1,
  s: 2,
  e: 4,
  w: 8,
  dirs: ['n', 's', 'e', 'w'],
  dx: { e: 1, w: -1, n: 0, s: 0 },
  dy: { e: 0, w: 0, n: -1, s: 1 },
  opposite: { e: 8, w: 4, n: 2, s: 1 }
})

export { Direction as default }
