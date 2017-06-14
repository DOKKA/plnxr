var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

//path is relative to bin directory
var poloniexPromise = require('../poloniex-promise')();

module.exports = sellCommand;

function sellCommand(argv){
    Promise.all([poloniexPromise.returnCompleteBalances(), poloniexPromise.returnTicker()]).then(function(data){

        var balances = data[0];
        var ticker = data[1];
        var obj = {};
        var currArr = argv.currencyPair.split('_');
        var baseCurrency = currArr[0].toUpperCase();
        var tradeCurrency = currArr[1].toUpperCase();
        var currencyPair = argv.currencyPair.toUpperCase();

        var balanceObj = balances[tradeCurrency];
        var availableBalance = parseFloat(balanceObj.available);
        
        var tickerObj = ticker[currencyPair];
        var highestBid = parseFloat(tickerObj.highestBid);

        var sellAmount = argv.p ? availableBalance * argv.p /100.0 : availableBalance;
        var sellPrice = argv.l ? highestBid * argv.l/100.0 + highestBid : highestBid;
        if(argv.panic){
            console.log('LEARN TO HODL'.magenta);
        }

        console.log(`about to sell ${sellAmount} ${tradeCurrency} at ${sellPrice}`);

        if(argv.panic){
            sellPrice = sellPrice - 0.00000003;
        }
        sellPrice = parseFloat(sellPrice.toFixed(8));
        sellAmount = parseFloat(sellAmount.toFixed(8));


        poloniexPromise.sell(baseCurrency, tradeCurrency, sellPrice,sellAmount).then(function(result){
            var trades = result.resultingTrades
            if(trades && trades.length && trades.length > 0){
                trades.forEach(function(trade){
                    console.log(`Sold ${trade.amount} ${tradeCurrency} at ${trade.rate}`);
                });
            }
            console.log('done');
        });
    });
}
