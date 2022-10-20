"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
// const chalk = require('chalk')
class Log {
    info(text) {
        console.log(chalk_1.default.blue('[autoIcon] '), text);
    }
    error(text) {
        console.log(chalk_1.default.red('[autoIcon] '), text);
    }
    warning(text) {
        return chalk_1.default.yellow(text);
    }
    log(text) {
        console.log(text);
    }
    done(text) {
        return chalk_1.default.bgHex('#0dbc79')(text);
    }
    success(text) {
        console.log(chalk_1.default.hex('#0dbc79')('[autoIcon] '), text);
    }
    link(text) {
        return chalk_1.default.hex('#42a5f5').underline(text);
    }
    ok() {
        this.success(this.done(' DONE '));
    }
    clear() {
        const lines = process.stdout.getWindowSize()[1];
        for (let i = 0; i < lines; i++) {
            console.log('\r\n');
        }
        console.clear();
    }
}
exports.default = new Log();
