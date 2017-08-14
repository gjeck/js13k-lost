const fs = require('fs')
const archiver = require('archiver')

test('the project is under 13kb', () => {
  let output = fs.createWriteStream('./dist/build.zip')
  let archive = archiver('zip', {
    zlib: { level: 9 }
  })

  output.on('close', function() {
    expect(archive.pointer()).toBeLessThanOrEqual(13312)
  })

  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn(err)
    } else {
      throw err
    }
  })

  archive.on('error', function(err) {
    throw err
  })

  archive.pipe(output)
  archive.directory('dist/app/', false)
  archive.finalize()
})
