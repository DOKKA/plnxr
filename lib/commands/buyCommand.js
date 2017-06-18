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

function getBalanceAndTicker(currencyPair,argv){
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
            argv: argv,
            baseCurrency: baseCurrency,
            tradeCurrency: tradeCurrency,
            balanceObj: balanceObj,
            tickerObj: tickerObj,
            availableBalance: availableBalance,
            lowestAsk: lowestAsk
        };

    });
}


function calculateBuy(obj){
    var argv = obj.argv;
    var availableBalance = obj.availableBalance;
    var lowestAsk = obj.lowestAsk;
    var baseCurrency = obj.baseCurrency;
    var tradeCurrency = obj.tradeCurrency;
    var rate = argv.r ? argv.r : obj.lowestAsk;
    var amount = 0;
    var baseAmount = 0;
    
    if(argv.l){
        var limit = parseFloat(argv.l);
        rate = rate - (limit / 100.0) * rate;
    }

    if(argv.p){
        console.log(availableBalance)
        var baseBuyPercentage = parseFloat(argv.p);
        baseAmount = baseBuyPercentage/100.0 * availableBalance;
        amount = baseAmount/rate;
    } else if(argv.a){
        amount = parseFloat(argv.a);
        baseAmount = amount * rate;
    } else if(argv.t){
        baseAmount = parseFloat(argv.t);
        amount = baseAmount/rate;
    }

    obj.rate = parseFloat(rate.toFixed(8));
    obj.amount = parseFloat(amount.toFixed(8));
    obj.baseAmount = parseFloat(baseAmount.toFixed(8));

    return obj;
}

function placeBuy(obj){
    var argv = obj.argv;
    var baseCurrency = obj.baseCurrency;
    var tradeCurrency = obj.tradeCurrency;
    var amount = obj.amount;
    var rate = obj.rate;
    var baseAmount = obj.baseAmount;

    console.log(`About to buy ${amount} ${tradeCurrency} at a rate of ${rate} (${baseAmount} btc)`);
    //if not a dry run
    if(!argv.d){
        return poloniexPromise.buy(baseCurrency, tradeCurrency, rate,amount)
        .then(function(result){
            var trades = result.resultingTrades
            obj.result = result;
            if(trades && trades.length && trades.length > 0){
                trades.forEach(function(trade){
                    console.log(`Bought ${trade.amount} ${tradeCurrency} at ${trade.rate}`);
                });
            }
            console.log('Buy order placed.');
            return obj;
        });
    } else {
        return obj;
    }
}


function buyCommand(argv){

    var currencyPair = argv.currencyPair.replace('-','_').toUpperCase();

    getBalanceAndTicker(currencyPair,argv)
        .then(calculateBuy)
        .then(placeBuy)
        .then(function(obj){
            console.log('done');
        });
}