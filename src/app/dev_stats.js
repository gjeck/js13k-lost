function DevStats(spec) {
  const s = spec || {}
  const elem = s.elem
  let isEnabled = s.isEnabled || true
  let panicCount = 0
  let runResults = []
  let startTime = 0
  const runs = 1000
  let perfOutput = ''

  const tick = function() {
    startTime = performance.now()
  }

  const tock = function() {
    let endTime = performance.now()
    if (runResults.length < runs) {
      runResults.push(endTime - startTime)
    } else if (runResults.length === runs) {
      let sum = runResults.reduce((sum, value) => { return sum + value }, 0)
      let avg = sum / runResults.length
      let min = Math.min.apply(null, runResults)
      let max = Math.max.apply(null, runResults)
      perfOutput = `runs: ${runResults.length}, min: ${min}, max: ${max}, avg: ${avg}`
      runResults.push('junk')
    }
  }

  const render = function(fps, panic) {
    if (!isEnabled) {
      return
    }
    panicCount += panic ? 1 : 0
    elem.innerHTML = `
    <ul>
      <li>fps: ${(fps).toFixed(2)}</li>
      <li>panicCount: ${panicCount}</li>
      <li>perf: ${perfOutput}</li>
    </ul>
    `
  }

  const setIsEnabled = function(enabled) {
    isEnabled = enabled
  }

  return {
    render: render,
    setIsEnabled: setIsEnabled,
    tick: tick,
    tock: tock
  }
}

export { DevStats as default }
