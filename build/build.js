'use strict'

require('./check-versions')()
require('dotenv').config()

process.env.NODE_ENV = 'production'

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')

const spinner = ora('building for production...')
spinner.start()
const isCI = Boolean(process.env.CI)

function exitBuild (code) {
  // Netlify/CI can keep stale handles open in old webpack toolchains.
  // Exit explicitly so build jobs don't time out after compilation.
  setImmediate(() => process.exit(code))
}

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) {
    spinner.stop()
    console.error(err)
    return exitBuild(1)
  }

  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) {
      console.error(err)
      return exitBuild(1)
    }

    process.stdout.write(stats.toString({
      colors: true,
      modules: !isCI,
      children: false,
      chunks: !isCI,
      chunkModules: false
    }) + '\n\n')

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
    return exitBuild(stats.hasErrors() ? 1 : 0)
  })
})
