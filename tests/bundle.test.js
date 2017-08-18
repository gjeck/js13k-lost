const fs = require('fs')
const archiver = require('archiver')

function archive() {
  return new Promise((resolve, reject) => {
    let output = fs.createWriteStream('./dist/build.zip')
    let archive = archiver('zip', {
      zlib: { level: 9 }
    })

    output.on('close', function() {
      let size = archive.pointer()
      resolve({ size: size })
    })

    archive.on('warning', function(err) {
      reject(new Error(err.message))
      throw err
    })

    archive.on('error', function(err) {
      reject(new Error(err.message))
      throw err
    })

    archive.pipe(output)
    archive.directory('dist/app/', false)
    archive.finalize()
  })
}

test('the project is under 13kb', () => {
  expect.assertions(1)
  return archive().then(data => {
    expect(data.size).toBeLessThanOrEqual(13312)
    console.log('Project is utilizing:\n \x1b[33m%s\x1b[0m', data.size + '/13312 bytes')
  })
})
