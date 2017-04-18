const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const { map, prop, uniq } = require('lodash/fp')
const chalk = require('chalk')

const { analyseVersions, extractTemplateFromUrl } = require('./morph')

module.exports = function doINeedToPromoteAnythingInThis (config) {
  return fs.readFileAsync(config, 'utf-8')
    .then(JSON.parse)
    .then(prop('contents'))
    .then(map(prop('endpoint')))
    .then(map(extractTemplateFromUrl))
    .then(uniq)
    .then(map(analyseVersions))
    .all()
    .then(map(outputVersions))
    .catch(SyntaxError, configCouldNotBeParsed)
    .error(configCouldNotBeLoaded)
}

function configCouldNotBeLoaded () {
  throw new Error('Config file could not be loaded')
}

function configCouldNotBeParsed (e) {
  throw new Error(`The config file is not valid JSON (${e.message})`)
}

function outputVersions ({ name, versions }) {
  if (versions.int === versions.live) {
    console.log(chalk.green(`🎉  ${chalk.bold(name)} is up-to-date on all environments`))
  }

  if (versions.int === versions.test && versions.test !== versions.live) {
    console.log(chalk.cyan(`💁  ${chalk.bold(name)} needs to be promoted to live (${chalk.bold(versions.live)} -> ${chalk.bold(versions.test)})`))
  }

  if (versions.int !== versions.test) {
    console.log(chalk.yellow(`🙋  ${chalk.bold(name)} needs to be promoted to test (${chalk.bold(versions.test)} -> ${chalk.bold(versions.int)})`))
  }
}
