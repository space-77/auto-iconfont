#!/usr/bin/env node

const program = require('commander')
const { init } = require('../lib/index')

program
  .command('build')
  .description('生成代码')
  .action(() => {
    init()
  })

program.parse(process.argv)
