const readline = require('readline');

/**
 * Some simple util functions for the console
 */

function logWithoutNewline(message) {
    process.stdout.write(message)
}

function clearCurrentLine() {
    readline.cursorTo(process.stdout, 0)
    readline.clearLine(process.stdout, 0)
}

module.exports = {
    clearCurrentLine,
    logWithoutNewline
}
