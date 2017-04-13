const Promise = require('bluebird')
const HttpClient = require('bbc-http-client')
const chalk = require('chalk')
const { prop } = require('lodash/fp')

const client = new HttpClient({ timeout: 10000 })

module.exports.extractTemplateFromUrl = (url) => url.split(/\/(data|view)\//)[2].split(/(\/|\?)/)[0]

module.exports.analyseVersions = (template) => {
  Promise.all([
    getIntVersion(template),
    getTestVersion(template),
    getLiveVersion(template)
  ]).then(([vInt, vTest, vLive]) => {
    if (vInt === vLive) {
      console.log(chalk.green(`🎉  ${chalk.bold(template)} is up-to-date on all environments`))
    }

    if (vInt === vTest && vTest !== vLive) {
      console.log(chalk.cyan(`💁  ${chalk.bold(template)} needs to be promoted to live (${chalk.bold(vTest)} -> ${chalk.bold(vLive)})`))
    }

    if (vInt !== vTest) {
      console.log(chalk.yellow(`🙋  ${chalk.bold(template)} needs to be promoted to test (${chalk.bold(vInt)} -> ${chalk.bold(vTest)})`))
    }
  })
}

function getIntVersion (template) {
  return getVersion(`https://manager.morph.int.api.bbci.co.uk/module/${template}/environmentVersion`, template)
}

function getTestVersion (template) {
  return getVersion(`https://manager.morph.test.api.bbci.co.uk/module/${template}/environmentVersion`, template)
}

function getLiveVersion (template) {
  return getVersion(`https://manager.morph.api.bbci.co.uk/module/${template}/environmentVersion`, template)
}

function getVersion (url, template) {
  return new Promise((resolve, reject) => {
    client.get({
      url,
      json: true
    }, (err, resp, json) => {
      if (err) {
        reject(err)
      } else {
        resolve(prop('version', json))
      }
    })
  })
}
