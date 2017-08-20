export default function DevStats(spec) {
  const s = spec || {}
  const elem = s.elem
  let isEnabled = s.isEnabled || true
  let panicCount = 0

  const render = function(fps, panic) {
    if (!isEnabled) {
      return
    }
    panicCount += panic ? 1 : 0
    elem.innerHTML = `
    <ul>
      <li>fps: ${(fps).toFixed(2)}</li>
      <li>panicCount: ${panicCount}</li>
    </ul>
    `
  }

  const setIsEnabled = function(enabled) {
    isEnabled = enabled
  }

  return {
    render: render,
    setIsEnabled: setIsEnabled
  }
}
