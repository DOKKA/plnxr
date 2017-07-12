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

        var balanceList = data[0];
        var ticker = data[1];

        var bitcoinPriceUSD = parseFloat(ticker['USDT_BTC'].last);

        var balances = _(balanceList).mapValues(function(balanceObj){
            return {
                available: parseFloat(balanceObj.available),
                onOrders: parseFloat(balanceObj.onOrders),
                btcValue: parseFloat(balanceObj.btcValue),
            }
        }).pickBy(function(balanceObj,key){
            return balanceObj.btcValue > 0 || balanceObj.available > 0;
        }).value();

        var marketList = _(ticker).mapValues(function(tickerObj,key){
            var uuu = key.split('_');
            return {
                price: parseFloat(tickerObj.last),
                percentChange: parseFloat(tickerObj.percentChange),
                baseCurrency: uuu[0],
                tradeCurrency: uuu[1]
            };
        }).value();

        var markets = _(balances).mapValues(function(balanceObj, key){
            if(key === 'BTC'){
                return Object.assign(marketList['USDT_BTC'], balanceObj);
            } else if(key === 'USDT'){
                var market = { 
                    price: 1,
                    percentChange: 0,
                    baseCurrency: 'USD',
                    tradeCurrency: 'USDT'
                };
                return Object.assign(market, balanceObj);
            } else {
                var marketName = 'BTC_'+key;
                return Object.assign( marketList[marketName],balanceObj);
            }
        }).value();


        var table  = new Table({head: ['Coin'.cyan, 'Rate'.cyan, '% Change'.cyan, 'BTC Value'.cyan, 'USD Value'.cyan]});

        var tableRows = [];
        for(var key in markets){
            var market = markets[key];

            var marketName = market.baseCurrency + '_'+ market.tradeCurrency;
            var pc = market.percentChange*100;
            var pc2 = '';
            if(pc > 0){
                pc2 = pc.toFixed(2).green;
            } else {
                pc2 = pc.toFixed(2).red;
            }

            var btcValue = 0;
            var usdValue = 0;
            if(market.tradeCurrency === 'BTC'){
                btcValue = market.btcValue;
                usdValue = btcValue * bitcoinPriceUSD;
            } else if(market.tradeCurrency === 'USDT'){
                btcValue = 0;
                usdValue = market.available;
            } else {
                btcValue = market.btcValue;
                usdValue = btcValue * bitcoinPriceUSD;
            }

            tableRows.push([marketName, market.price.toFixed(8), pc2, btcValue, '$'+((usdValue).toFixed(2))]);
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