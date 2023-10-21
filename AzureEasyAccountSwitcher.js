const util = require('util');
const exec = util.promisify(require('child_process').exec);
const cliSelect = require('cli-select');
const chalk = require('chalk');
const readline = require('readline')
const {clearCurrentLine, logWithoutNewline} = require('./utils/EasyConsoleUtils.js')

const log = console.log

async function createSwitchAccountPrompt() {

    try {

        if (!await isAzureCLIInstalled()) {
            log(chalk.red("Azure CLI is not installed. Please install it first."))
            process.exit(0)
        }

        logWithoutNewline(chalk.blue.bold("Connection to azure..."));

        const AccountListOutput = (await exec('az account list')).stdout;
        const accountsJSON = JSON.parse(AccountListOutput)

        if (accountsJSON.length === 0) {
            clearCurrentLine()
            log(chalk.red("No accounts found. Please login first with az login."))
            log()
            process.exit(0)
        }

        const AccountShowOutput = (await exec('az account show')).stdout;
        const currentAccountJSON = JSON.parse(AccountShowOutput)

        const accountSelections = {}

        accountsJSON.forEach(account => {
            accountSelections[account.id] = account.name + chalk.green(" (" + account.id + ")")
        })

        clearCurrentLine()
        log(chalk.blue.bold("Select your Azure Account:"))


        cliSelect({
            values: accountSelections,
            selected: chalk.red('->'),
            unselected: '  ',
            valueRenderer: (value, selected) => {

                let activeFlag = ""

                if (accountSelections[currentAccountJSON.id] === value) {
                    activeFlag = chalk.magenta("[Active] ")
                }

                return activeFlag + value
            }
        }, (response) => {
            selectAccountActionCallback(response, accountSelections)
        });

    } catch (e) {
        console.error("Something went wrong: " + e)
    }

}

async function selectAccountActionCallback(response, accounts) {
    if (response !== null && response.id !== undefined && response.id) {

        readline.moveCursor(process.stdout, 0, -1)
        clearCurrentLine()

        logWithoutNewline(chalk.blue.bold("Connection to azure..."));

        await setAccount(response.id)

        clearCurrentLine()

        log(chalk.blue.bold("Switched account to: ") + accounts[response.id])
        log()

    } else {
        log(chalk.red('action canceled'));
    }
}

async function setAccount(accountID) {
    const {stdout, stderr} = await exec(`az account set --subscription "${accountID}"`);
}

async function isAzureCLIInstalled() {
    try {
        const {stdout, stderr} = await exec('az --version');
        return true
    } catch (e) {
        return false
    }
}

module.exports = {createSwitchAccountPrompt}
