#!/usr/bin/env node

const program = require('commander')
const { init } = require('../lib/index')

program
  .command('build')
  .description('็ๆไปฃ็ ')
  .action(() => {
    init()
  })

program.parse(process.argv)
