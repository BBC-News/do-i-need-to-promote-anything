const Promise = require('bluebird')
const HttpClient = require('bbc-http-client')
const { prop } = require('lodash/fp')

const client = new HttpClient({ timeout: 30000 })
const lameCache = {}

module.exports.extractTemplateFromUrl = (url) => url.split(/\/(data|view)\//)[2].split(/(\/|\?)/)[0]

module.exports.analyseVersions = (template) => Promise.all([
  getIntVersion(template),
  getTestVersion(template),
  getLiveVersion(template)
]).then(([vInt, vTest, vLive]) => ({
  name: template,
  versions: {
    int: vInt,
    test: vTest,
    live: vLive
  }
}))

module.exports.getDependencies = (template) =>
  getJson('https://manager.morph.int.api.bbci.co.uk/versions')
    .then(prop(`modules.${template}.dependencies`))
    .then(dependencies => ({
      name: template,
      dependencies
    }))

function getIntVersion (template) {
  return getJson(`https://manager.morph.int.api.bbci.co.uk/module/${template}/environmentVersion`)
    .then(prop('version'))
}

function getTestVersion (template) {
  return getJson(`https://manager.morph.test.api.bbci.co.uk/module/${template}/environmentVersion`)
    .then(prop('version'))
}

function getLiveVersion (template) {
  return getJson(`https://manager.morph.api.bbci.co.uk/module/${template}/environmentVersion`)
    .then(prop('version'))
}

function getJson (url) {
  return new Promise((resolve, reject) => {
    if (lameCache[url]) {
      return resolve(lameCache[url])
    }

    client.get({
      url,
      json: true
    }, (err, resp, json) => {
      if (err) {
        return reject(err)
      }

      lameCache[url] = json

      resolve(json)
    })
  })
}
