import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';

function menu() {
    inquirer.prompt([{
        type: 'list',
        name: 'menuOption',
        message: 'Selecione uma opção',
        choices: ["Criar Conta", "Consultar Saldo", "Depositar", "Sacar", "Sair"]
    }])
        .then(response => {
            const menuOption = response['menuOption']
            if (menuOption === 'Criar Conta') {
                createAccount()
            }else if(menuOption === 'Consultar Saldo'){
                getAccountBalance()
            }else if(menuOption === 'Depositar'){
                deposit()
            }else if(menuOption === 'Sacar'){
                withdraw()
            }else if(menuOption === 'Sair'){
                console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
                process.exit()
            }
        })
        .catch(e => console.log(e))
}

function createAccount() {
    // console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'))
    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite o nome da sua conta:'
    }])
        .then(res => {
            const accountName = res['accountName']
            if (!fs.existsSync('clients')) {
                fs.mkdirSync('clients')
            }
            if (fs.existsSync(`clients/${accountName}.json`)) {
                console.log(chalk.bgRed.black('Essa conta já existe! Escolha outro nome.'))
                createAccount()
                return
            }

            fs.writeFileSync(`clients/${accountName}.json`, '{"balance": 0}', erro => {
                console.log(erro)
            })
            console.log(chalk.green('Sua conta foi criada com sucesso!'))
            menu()

        })
        .catch(e => console.log(e))
}

function getAccountBalance(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then(res => {
        const accountName = res['accountName']
        if(!checkAccount(accountName)){
            getAccountBalance()
            return
        }
        const account = getAccount(accountName)
        console.log(chalk.green(`Seu saldo é: R$ ${account.balance}`))
        menu()
    })
    .catch(e => console.log(e))
}

function deposit(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then(res => {
        const accountName = res['accountName']
        if(!checkAccount(accountName)){
            deposit()
            return
        }
        inquirer.prompt([{
            name: 'amount',
            message: 'Digite o valor de depósito:'
        }])
        .then(res => {
            const amount = res['amount']
            addAmount(accountName, amount)
            menu()
        })
        .catch(e => console.log(e))
    })
    .catch(e => console.log(e))
}

function withdraw(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then(res => {
        const accountName = res['accountName']
        if(!checkAccount(accountName)){
            withdraw()
            return
        }
        inquirer.prompt([{
            name: 'amount',
            message: 'Digite o valor de saque:'
        }])
        .then(res => {
            const amount = res['amount']
            removeAmount(accountName, amount)
            menu()
        })
        .catch(e => console.log(e))
    })
    .catch(e => console.log(e))
}

function checkAccount(accountName){
    if(!fs.existsSync(`clients/${accountName}.json`)){
        console.log(chalk.bgRed.black('Essa conta não existe!'))
        return false
    }
    return true
}

function addAmount(accountName, amount){
    const account = getAccount(accountName)
    if(!account){
        console.log(chalk.bgRed.black('Ocorreu algum erro. Tente mais tarde!'))
        return deposit()
    }
    account.balance = parseFloat(amount) + parseFloat(account.balance)
    fs.writeFileSync(`clients/${accountName}.json`, JSON.stringify(account), erro => {
        console.log(erro)
    })
    console.log(chalk.green(`Depósito de R$ ${account.balance} efetuado com sucesso!`))
}

function removeAmount(accountName, amount){
    const account = getAccount(accountName)
    if(!account){
        console.log(chalk.bgRed.black('Ocorreu algum erro. Tente mais tarde!'))
        return withdraw()
    }
    const accountBalance = parseFloat(account.balance)
    const amountParser = parseFloat(amount)
    if(amountParser > accountBalance){
        console.log(chalk.bgRed.black('Saldo insuficiente!'))
        withdraw()
        return
    }
    account.balance = accountBalance - amountParser
    fs.writeFileSync(`clients/${accountName}.json`, JSON.stringify(account), erro => {
        console.log(erro)
    })
    console.log(chalk.green(`Saque de R$ ${amountParser} efetuado com sucesso!`))
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`clients/${accountName}.json`, 'utf-8', erro => {
        console.log(erro)
    })
    return JSON.parse(accountJSON)
}
menu()