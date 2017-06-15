var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');
var apiKey = process.env.API_KEY || argv.key;
var secret = process.env.API_SECRET || argv.secret;

//path is relative to bin directory
var poloniexPromise = require('../poloniex-promise')();

module.exports = buyCommand;

function getBalanceAndTicker(currencyPair){
    return Promise.all([poloniexPromise.returnCompleteBalances(), poloniexPromise.returnTicker()]).then(function(data){

            var balances = data[0];
            var ticker = data[1];

            var currArr = currencyPair.split('_');
            var baseCurrency = currArr[0].toUpperCase();
            var tradeCurrency = currArr[1].toUpperCase();

            var balanceObj = balances[baseCurrency];
            var availableBalance = parseFloat(balanceObj.available);

            var tickerObj = ticker[currencyPair];
            var lowestAsk = parseFloat(tickerObj.lowestAsk);

            return {
                baseCurrency: baseCurrency,
                tradeCurrency: tradeCurrency,
                balanceObj: balanceObj,
                tickerObj: tickerObj,
                availableBalance: availableBalance,
                lowestAsk: lowestAsk
            };

    });
}


function buyCommand(argv){
//match currencyPair and give an error for not a valid currencyPair

    var currencyPair = argv.currencyPair.replace('-','_').toUpperCase()
    if(argv.p){
        //buy using percentage of base currency
        getBalanceAndTicker(currencyPair).then(function(obj){
            var availableBalance = obj.availableBalance;
            var lowestAsk = obj.lowestAsk;
            var baseCurrency = obj.baseCurrency;
            var tradeCurrency = obj.tradeCurrency;
            var baseBuyPercentage = parseFloat(argv.p);

            var baseAmount = baseBuyPercentage/100.0 * availableBalance;
            var amount = baseAmount/lowestAsk;

            console.log(`About to buy ${amount.toFixed(8)} ${tradeCurrency} at a rate of ${lowestAsk}`)
        });
    } else if(argv.a){
        //buy using amount of trade currency

    } else if(argv.t){
        //buy using total in base currency

    } else {
        console.log('You must specify a base buy percentage, total, or amount to buy.');
    }
}
