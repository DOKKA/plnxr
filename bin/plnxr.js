#!/usr/bin/env node

var yargs = require('yargs');
var commands = require('../lib/index');

var argv=yargs.usage('$0 <cmd> [args]')
.command({
    command: 'balance [args]',
    aliases: ['bal'],
    desc: 'list your balances',
    builder: (yargs) => yargs,
    handler: commands.balanceCommand
})
.command({
    command: 'list [market] [args]',
    aliases: ['ls'],
    desc: 'list markets',
    builder: (yargs) => yargs.default('market','BTC'),
    handler: commands.listCommand
})
.command({
    command: 'buy <currencyPair> [args]',
    desc: 'buy some coins',
    builder: (yargs) => {
        return yargs.option('baseBuyPercentage',{
            alias: 'p',
            demandOption: true,
            describe: 'the percentage of your base currency to use for purchasing',
            type: 'number'
        }).option('sellLimitPercentage',{
            alias: 'l',
            demandOption: false,
            describe: 'the percentage higher you want to sell the currency for',
            type: 'number'
        });
    
    },
    handler: commands.buyCommand
})
.command({
    command: 'sell <currencyPair> [args]',
    desc: 'sell some coins',
    builder: (yargs) => {
        return yargs.option('baseSellPercentage',{
            alias: 'p',
            demandOption: false,
            describe: 'the percentage of your trade currency to use for selling',
            type: 'number'
        }).option('sellLimitPercentage',{
            alias: 'l',
            demandOption: false,
            describe: 'the percentage higher you want to sell the currency for',
            type: 'number'
        }).option('panicSell',{
            alias: 'panic',
            demandOption: false,
            describe: 'sell at a slightly lower price to ensure the order fills',
            type: 'boolean'
        });
    },
    handler: commands.sellCommand
})
.command({
    command: 'orders [currencyPair]',
    aliases: ['ord'],
    desc: 'list open orders',
    builder: (yargs) => yargs,
    handler: commands.ordersCommand
})
.version()
.help().argv;