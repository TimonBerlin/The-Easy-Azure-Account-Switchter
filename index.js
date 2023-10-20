#! /usr/bin/env node
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const cliSelect = require('cli-select');
const chalk = require('chalk');

const log = console.log

async function init() {

    try {

        if(!await isAzureCLIInstalled()){
            log(chalk.red("Azure CLI is not installed. Please install it first."))
            process.exit(0)
        }

        const {stdout, stderr} = await exec('az account list');
        const AccountShowOutput = (await exec('az account show')).stdout;

        const currentAccountJSON = JSON.parse(AccountShowOutput)

        const accountsJSON = JSON.parse(stdout)
        const accountNames = {}

        accountsJSON.forEach(account => {
            accountNames[account.id] = account.name + chalk.green(" (" + account.id + ")")
        })

        log(chalk.blue.bold("Select your Azure Account:"))

        cliSelect({
            values: accountNames,
            selected: chalk.red('->'),
            unselected: '  ',
            valueRenderer: (value, selected) => {

                let activeFlag = ""

                if (accountNames[currentAccountJSON.id] === value) {
                    activeFlag = chalk.magenta("[Active] ")
                }

                return activeFlag + value
            }
        }, (response) => {
            selectAccountActionCallback(response, accountNames)
        });

    } catch (e) {
        console.error("Something went wrong: " + e)
    }

}

async function selectAccountActionCallback(response, accounts) {
    if (response !== null) {
        await setAccount(response.id)

        log("switched account to " + accounts[response.id])
    } else {
        log('nothing cancelled');
    }
}

async function setAccount(accountID) {
    const {stdout, stderr} = await exec(`az account set --subscription "${accountID}"`);
}

async function isAzureCLIInstalled(){
    try {
        const {stdout, stderr} = await exec('az --version');
        return true
    } catch (e) {
        return false
    }
}

init()
