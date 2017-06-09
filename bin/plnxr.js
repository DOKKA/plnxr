#!/usr/bin/env node

var yargs = require('yargs');
var commands = require('../lib/index');

var argv=yargs.usage('$0 <cmd> [args]')
    .command('balance [args]', 'list your balances',function(yargs){
        return yargs;
    },function(argv){
        commands.balanceCommand(argv);
    })
    .command('list [args]', 'list markets',function(yargs){
        return yargs.option('market',{
            alias: 'm',
            demandOption: false,
            default: 'BTC',
            describe: 'the market to list (BTC, ETH, XMR, USDT)',
            type: 'string'
        })
    },function(argv){
        commands.listCommand(argv);
    })
    .command('buy [args]', 'buy some coins',function(yargs){
        return yargs.option('currencyPair',{
            alias: 'c',
            demandOption: true,
            describe: 'the currency pair to trade on',
            type: 'string'
        }).option('baseBuyPercentage',{
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
    
    },function(argv){
        commands.buyCommand(argv);
    })
    .command('sell [args]', 'sell some coins',function(yargs){
        return yargs.option('currencyPair',{
            alias: 'c',
            demandOption: true,
            describe: 'the currency pair to trade on',
            type: 'string'
        }).option('baseSellPercentage',{
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
    
    },function(argv){
        commands.sellCommand(argv);
    })
    .help().argv;