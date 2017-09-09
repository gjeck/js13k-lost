function createRunLoop(spec) {
  const s = spec || {}
  const emitter = s.emitter
  let simulationTimestep = s.simulationTimestep || (1000 / 60)
  let frameDelta = s.frameDelta || 0
  let lastFrameTimeMs = s.lastFrameTimeMs || 0
  let fps = s.fps || 60
  let fpsAlpha = s.fpsAlpha || 0.9
  let fpsUpdateInterval = s.fpsUpdateInterval || 1000
  let lastFpsUpdate = s.lastFpsUpdate || 0
  let framesSinceLastFpsUpdate = s.framesSinceLastFpsUpdate || 0
  let numUpdateSteps = s.numUpdateSteps || 0
  let minFrameDelay = s.minFrameDelay || 0
  let running = s.running || false
  let started = s.started || false
  let panic = s.panic || false
  let rafHandle = null

  const isRunning = function() {
    return running
  }

  const getMaxAllowedFPS = function() {
    return 1000 / minFrameDelay
  }

  const resetFrameDelta = function() {
    const oldFrameDelta = frameDelta
    frameDelta = 0
    return oldFrameDelta
  }

  const start = function() {
    if (!started) {
      started = true
      rafHandle = requestAnimationFrame((timeStamp) => {
        emitter.emit('RunLoop:render', 1)

        running = true

        lastFrameTimeMs = timeStamp
        lastFpsUpdate = timeStamp
        framesSinceLastFpsUpdate = 0
        rafHandle = requestAnimationFrame(animate)
      })
    }
  }

  const stop = function() {
    running = false
    started = false
    cancelAnimationFrame(rafHandle)
  }

  const animate = function(timeStamp) {
    rafHandle = requestAnimationFrame(animate)
    if (timeStamp < lastFrameTimeMs + minFrameDelay) {
      return
    }

    frameDelta += timeStamp - lastFrameTimeMs
    lastFrameTimeMs = timeStamp
    emitter.emit('RunLoop:begin', timeStamp, frameDelta)

    if (timeStamp > lastFpsUpdate + fpsUpdateInterval) {
      fps = fpsAlpha * framesSinceLastFpsUpdate * 1000 / (timeStamp - lastFpsUpdate) + (1 - fpsAlpha) * fps

      lastFpsUpdate = timeStamp
      framesSinceLastFpsUpdate = 0
    }
    framesSinceLastFpsUpdate += 1

    numUpdateSteps = 0
    while (frameDelta >= simulationTimestep) {
      emitter.emit('RunLoop:update', simulationTimestep)
      frameDelta -= simulationTimestep
      if (++numUpdateSteps >= 240) {
        panic = true
        break
      }
    }

    emitter.emit('RunLoop:render', frameDelta / simulationTimestep)
    emitter.emit('RunLoop:end', fps, panic)

    panic = false
  }

  return {
    isRunning: isRunning,
    getMaxAllowedFPS: getMaxAllowedFPS,
    resetFrameDelta: resetFrameDelta,
    start: start,
    stop: stop,
    animate: animate
  }
}

export { createRunLoop as default }
