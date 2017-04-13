#!/usr/bin/env node

const args = process.argv.slice(2)

if (args.length !== 1) {
  console.log('Usage: dintpa path/to/mozart/config.json')
  process.exit(1)
}

require('../src/index')(args[0]).catch(e => {
  console.error(`🤖 🔥 🚨  BLEEP BLOOP some code threw an error: ${e.message}`)
  console.error('🤖 🔥 🚨  I pity you, human. Here is the stack trace:')
  console.error(e)
  process.exit(1)
})
