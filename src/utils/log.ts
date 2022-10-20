import chalk from 'chalk'
// const chalk = require('chalk')

class Log {
  info(text: string) {
    console.log(chalk.blue('[autoIcon] '), text)
  }

  error(text: string) {
    console.log(chalk.red('[autoIcon] '), text)
  }

  warning(text: string) {
    return chalk.yellow(text)
  }

  log(text: string) {
    console.log(text)
  }

  done(text: string) {
    return chalk.bgHex('#0dbc79')(text)
  }

  success(text: string) {
    console.log(chalk.hex('#0dbc79')('[autoIcon] '), text)
  }

  link(text: string) {
    return chalk.hex('#42a5f5').underline(text)
  }

  ok() {
    this.success(this.done(' DONE '))
  }

  clear() {
    const lines = process.stdout.getWindowSize()[1]
    for (let i = 0; i < lines; i++) {
      console.log('\r\n')
    }
    console.clear()
  }
}

export default new Log()
