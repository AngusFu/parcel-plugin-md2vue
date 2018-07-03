const Bundler = require('parcel-bundler')
const Plugin = require('../lib/index')

const path = require('path')
const { readFile } = require('fs-extra')

it('should works as expected', async () => {
  const bundler = new Bundler(path.join(__dirname, '../fixture.md'), {
    outDir: path.join(__dirname, '../fixture'),
    watch: false,
    cache: false,
    hmr: false,
    logLevel: 0
  })

  Plugin(bundler)

  const bundle = await bundler.bundle()
  const result = (await readFile(bundle.name)).toString()
  expect(result).toMatchSnapshot()
})
