const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const { map, prop, uniq } = require('lodash/fp')
const chalk = require('chalk')

const { analyseVersions, getDependencies, extractTemplateFromUrl } = require('./morph')

exports.doINeedToPromoteAnythingInThis = function doINeedToPromoteAnythingInThis (config) {
  return getTemplatesFromConfig(config)
    .then(map(analyseVersions))
    .all()
    .then(map(outputVersions))
}

exports.doINeedToBumpAnythingInThis = function doINeedToBumpAnythingInThis (config, module) {
  console.log(`🤖  ℹ️   BLEEP BLOOP this will take about 20 seconds.`)
  console.log(`🤖  ℹ️   Please wait patiently.`)

  return getTemplatesFromConfig(config)
    .then(map(getDependencies))
    .all()
    .then(map(deps => outputBumpResults(module, deps)))
}

function getTemplatesFromConfig (config) {
  return fs.readFileAsync(config, 'utf-8')
    .then(JSON.parse)
    .then(prop('contents'))
    .then(map(prop('endpoint')))
    .then(map(extractTemplateFromUrl))
    .then(uniq)
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
    console.log(chalk.green(`✅  ${chalk.bold(name)} is up-to-date on all environments`))
  }

  if (versions.test !== versions.live) {
    console.log(chalk.cyan(`ℹ️  ${chalk.bold(name)} can be promoted to live (${chalk.bold(versions.live)} -> ${chalk.bold(versions.test)})`))
  }

  if (versions.int !== versions.test) {
    console.log(chalk.yellow(`⚠️  ${chalk.bold(name)} can be promoted to test (${chalk.bold(versions.test)} -> ${chalk.bold(versions.int)})`))
  }
}

function outputBumpResults (bumpModule, { name, dependencies }) {
  const bumpModuleVersions = dependencies[bumpModule]

  if (!bumpModuleVersions) {
    return console.log(chalk.green(`✅  ${chalk.bold(name)} is not dependent on ${chalk.bold(bumpModule)}`))
  }

  if (!bumpModuleVersions.available) {
    return console.log(chalk.green(`✅  ${chalk.bold(name)} has the latest version of ${chalk.bold(bumpModule)} (${bumpModuleVersions.version})`))
  }

  console.log(chalk.yellow(`⚠️  ${chalk.bold(name)} needs to be bumped to include the latest ${chalk.bold(bumpModule)} (${bumpModuleVersions.version} -> ${bumpModuleVersions.available})`))
}
