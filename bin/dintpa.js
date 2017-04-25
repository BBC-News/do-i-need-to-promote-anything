#!/usr/bin/env node

const commands = require('../src/index')
const pkg = require('../package.json')
const argv = require('minimist')(process.argv.slice(2))
const args = argv._

if (args.length !== 1 || argv.help) {
  console.log(`DINTPA v${pkg.version}

Because all this WAF FAFF requires another CLI

Usage:

    Check whether any modules in a config need to be promoted:
        dintpa path/to/mozart/config.json

    Check whether any modules in a config need to be bumped to get the latest version of $MODULE
        dintpa path/to/mozart/config.json --bump $MODULE
`)
  process.exit(1)
}

runCommand(args, argv).catch(e => {
  console.error(`🤖 🔥 🚨  BLEEP BLOOP some code threw an error: ${e.message}`)
  console.error('🤖 🔥 🚨  I pity you, human. Here is the stack trace:')
  console.error(e)
  process.exit(1)
})

function runCommand (args, argv) {
  if (argv.bump) {
    return commands.doINeedToBumpAnythingInThis(args[0], argv.bump)
  }

  return commands.doINeedToPromoteAnythingInThis(args[0])
}
