'use strict'

const path = require('path')
const config = require('../config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const sass = require('sass')

exports.assetsPath = function (_path) {
  const assetsSubDirectory =
    process.env.NODE_ENV === 'production'
      ? config.build.assetsSubDirectory
      : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  function generateLoaders (loader, loaderOptions) {
    const loaders = [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    if (options.extract) {
      return [MiniCssExtractPlugin.loader].concat(loaders)
    }
    return ['vue-style-loader'].concat(loaders)
  }

  const resources = [
    path.resolve(__dirname, '../src/stylesheets/variables.scss'),
    path.resolve(__dirname, '../src/stylesheets/mixins.scss'),
    path.resolve(__dirname, '../src/stylesheets/fonts.scss'),
    path.resolve(__dirname, '../src/stylesheets/functions.scss')
  ]

  if (process.env.ADMIN_CODE === 'japisale') {
    resources.unshift(path.resolve(__dirname, '../src/stylesheets/japi.scss'))
  }

  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { implementation: sass, sassOptions: { indentedSyntax: true } }),
    scss: generateLoaders('sass', { implementation: sass }).concat({
      loader: 'sass-resources-loader',
      options: {
        resources
      }
    }),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)
  for (const extension in loaders) {
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loaders[extension]
    })
  }
  return output
}
