const fs = require('fs')
const path = require('path')
const md2vue = require('md2vue')
const { Asset } = require('parcel-bundler')
const { loadFront } = require('yaml-front-matter')

function loadConfig () {
  const defaults = {
    target: 'js',
    inject: '',
    extend: {
      metaInfo: {}
    }
  }
  const configPath = path.resolve(process.cwd(), 'md2vue.config.js')
  if (fs.existsSync(configPath)) {
    return Object.assign(defaults, require(configPath))
  }

  return defaults
}

module.exports = class extends Asset {
  constructor (name, pkg, options) {
    super(name, pkg, options)
    this.type = 'js'
    this.filename = name
    this.config = loadConfig()
    this.config.name = `${name.replace(/\/|\\/, '-').replace(/\s*/, '')}`
  }

  async parse (str) {
    try {
      const [metadata, markdown] = splitMarkdown(str, 'body')
      const { title, layout, route, meta } = metadata

      const { extend: { metaInfo } } = this.config
      Object.assign(metaInfo, meta, { title })

      this.metadata = JSON.stringify({ layout, route })
      this.code = await md2vue(markdown, this.config)
    } catch (e) {
      const { filename } = this
      this.code = `
module.exports = {
  error: new Error('error occured: ${filename}'),
  stack: \`${e.stack}\`,
  message: \`${e.message}\`
}
`
    }
  }

  generate () {
    const { metadata, code } = this
    const reRemove = /window\.Vue && Vue\.use\(component\);\s*$/
    const replaced = code.replace(reRemove, 'false')
    const js = `${replaced}
module.exports.$$metadata = ${metadata}
`
    return { js }
  }
}

function splitMarkdown (markdown) {
  const data = loadFront(markdown, '__body__')
  const md = data['__body__']
  delete data['__body__']
  return [data, md]
}
