var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

//path is relative to bin directory
var poloniexPromise = require('../poloniex-promise')();

module.exports = balanceCommand;

function balanceCommand(argv){

    Promise.all([poloniexPromise.returnCompleteBalances(), poloniexPromise.returnTicker()]).then(function(data){

        var balances = data[0];
        var ticker = data[1];

        var usdBTCPrice = parseFloat(ticker['USDT_BTC'].last);

        var myBalances = _(balances).mapValues(function(balanceObj){
            return {
                available: parseFloat(balanceObj.available),
                onOrders: parseFloat(balanceObj.onOrders),
                btcValue: parseFloat(balanceObj.btcValue),
            }
        }).pickBy(function(balanceObj,key){
            return balanceObj.btcValue > 0;
        }).value();

        var activeMarkets = Object.keys(myBalances);

        var markets = _(ticker).mapValues(function(tickerObj,key){
            var uuu = key.split('_');
            return {
                price: parseFloat(tickerObj.last),
                percentChange: parseFloat(tickerObj.percentChange),
                baseCurrency: uuu[0],
                tradeCurrency: uuu[1]
            };
        }).pickBy(function(tickerObj,key){
            return (tickerObj.baseCurrency === 'BTC' || tickerObj.tradeCurrency === 'BTC') &&
                _.includes(activeMarkets, tickerObj.tradeCurrency);
        }).mapValues(function(market, key){
            return Object.assign(market, myBalances[market.tradeCurrency]);
        }).value();


        var table  = new Table({head: ['Coin'.cyan, 'Rate'.cyan, '% Change'.cyan, 'BTC Value'.cyan, 'USD Value'.cyan]});

        var tableRows = [];
        for(var key in markets){
            var market = markets[key];

            var pc = market.percentChange*100;
            var pc2 = '';
            if(pc > 0){
                pc2 = pc.toFixed(2).green;
            } else {
                pc2 = pc.toFixed(2).red;
            }
            tableRows.push([key, market.price.toFixed(8), pc2, market.btcValue, '$'+((market.btcValue * usdBTCPrice).toFixed(2))]);
        }

        _.orderBy(tableRows,function(row){
            return row[3];
        },'desc').forEach(function(row){
            table.push(row);
        });
        
        //print the table
        console.log(table.toString());
    });


}