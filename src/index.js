const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const { map, prop, uniq } = require('lodash/fp')

const { analyseVersions, extractTemplateFromUrl } = require('./morph')

module.exports = function doINeedToPromoteAnythingInThis (config) {
  return fs.readFileAsync(config, 'utf-8')
    .then(JSON.parse)
    .then(prop('contents'))
    .then(map(prop('endpoint')))
    .then(map(extractTemplateFromUrl))
    .then(uniq)
    .then(map(analyseVersions))
    .catch(SyntaxError, configCouldNotBeParsed)
    .error(configCouldNotBeLoaded)
}

function configCouldNotBeLoaded () {
  throw new Error('Config file could not be loaded')
}

function configCouldNotBeParsed (e) {
  throw new Error(`The config file is not valid JSON (${e.message})`)
}
