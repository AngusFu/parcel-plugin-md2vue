
const fs = require('fs')
const path = require('path')

const md2vue = require('md2vue')
const { Asset } = require('parcel-bundler')

function loadConfig () {
  const configPath = path.resolve(process.cwd(), 'md2vue.config.js')
  if (fs.existsSync(configPath)) {
    return require(configPath)
  }
  return {
    name: 'default',
    target: 'js',
    inject: ''
  }
}

module.exports = class extends Asset {
  constructor (name, pkg, options) {
    super(name, pkg, options)
    this.type = 'js'
    this.config = loadConfig()
  }

  async parse (str) {
    try {
      this.code = await md2vue(str, this.config)
    } catch (e) {
      this.code = `module.exports = new Error(\`${e.message}\`)`
      console.log(e)
    }
  }

  generate () {
    // Send to JS bundler
    return {
      'js': this.code
    }
  }
}
