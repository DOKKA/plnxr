var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

//path is relative to bin directory
var poloniexPromise = require('../poloniex-promise')();

module.exports = sellCommand;

function getBalanceAndTicker(currencyPair,argv){
    return Promise.all([poloniexPromise.returnCompleteBalances(), poloniexPromise.returnTicker()]).then(function(data){

        var balances = data[0];
        var ticker = data[1];

        var currArr = currencyPair.split('_');
        var baseCurrency = currArr[0].toUpperCase();
        var tradeCurrency = currArr[1].toUpperCase();

        var balanceObj = balances[tradeCurrency];
        var availableBalance = parseFloat(balanceObj.available);

        var tickerObj = ticker[currencyPair];
        var highestBid = parseFloat(tickerObj.highestBid);

        return {
            argv: argv,
            baseCurrency: baseCurrency,
            tradeCurrency: tradeCurrency,
            balanceObj: balanceObj,
            tickerObj: tickerObj,
            availableBalance: availableBalance,
            highestBid: highestBid
        };

    });
}

function calculateSell(obj){
    var argv = obj.argv;
    var availableBalance = obj.availableBalance;
    var highestBid = obj.highestBid;
    var baseCurrency = obj.baseCurrency;
    var tradeCurrency = obj.tradeCurrency;
    var rate = argv.r ? argv.r : obj.highestBid;
    var amount = 0;
    
    if(argv.l){
        var limit = parseFloat(argv.l);
        rate = (limit / 100) * rate + rate;
    }

    if(argv.panic){
        rate = rate - 0.00000003;
        console.log('LEARN TO HODL'.magenta);
    }

    if(argv.p){
        var tradeSellPercentage = parseFloat(argv.p);
        amount = tradeSellPercentage/100.0 * availableBalance;
    } else if(argv.a){
        amount = parseFloat(argv.a);
    } else if(argv.t){
        var baseAmount = parseFloat(argv.t);
        amount = baseAmount/rate;
    }

    obj.rate = parseFloat(rate.toFixed(8));
    obj.amount = parseFloat(amount.toFixed(8));

    return obj;
}

function placeSell(obj){
    var argv = obj.argv;
    var baseCurrency = obj.baseCurrency;
    var tradeCurrency = obj.tradeCurrency;
    var amount = obj.amount;
    var rate = obj.rate;

    console.log(`About to sell ${amount} ${tradeCurrency} at a rate of ${rate}`);
    //if not a dry run
    if(!argv.d){
        return poloniexPromise.sell(baseCurrency, tradeCurrency, rate,amount)
        .then(function(result){
            var trades = result.resultingTrades
            obj.result = result;
            if(trades && trades.length && trades.length > 0){
                trades.forEach(function(trade){
                    console.log(`Sold ${trade.amount} ${tradeCurrency} at ${trade.rate}`);
                });
            }
            console.log('Sell order placed.');
            return obj;
        });
    } else {
        return obj;
    }
}



function sellCommand(argv){
//match currencyPair and give an error for not a valid currencyPair
    var currencyPair = argv.currencyPair.replace('-','_').toUpperCase();

    getBalanceAndTicker(currencyPair,argv)
        .then(calculateSell)
        .then(placeSell)
        .then(function(obj){
            console.log('done');
        });
}