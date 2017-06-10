var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

//path is relative to bin directory
var poloniexPromise = require('../poloniex-promise')();


module.exports = listCommand;


function listCommand(argv){
    var baseCurrency = argv.market.toUpperCase();
    if(baseCurrency === "BTC" || baseCurrency === "ETH" || baseCurrency === "XMR" || baseCurrency === "USDT"){

    
    poloniexPromise.returnTicker().then(function(ticker){

        var markets = _(ticker).mapValues(function(tickerObj,key){
            var uuu = key.split('_');
            return {
                price: parseFloat(tickerObj.last),
                percentChange: parseFloat(tickerObj.percentChange),
                baseVolume: parseFloat(tickerObj.baseVolume),
                baseCurrency: uuu[0],
                tradeCurrency: uuu[1]
            };
        }).pickBy(function(tickerObj,key){
            return tickerObj.baseCurrency === baseCurrency;
        }).value();

        //console.log(markets);

        var table  = new Table({head: ['Coin'.cyan, 'Price'.cyan,'Volume'.cyan, '% Change'.cyan]});

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
            tableRows.push([key, market.price.toFixed(8), parseFloat(market.baseVolume.toFixed(3)), pc2]);
        }

        _.orderBy(tableRows,function(row){
            return row[2];
        },'desc').forEach(function(row){
            table.push(row);
        });
        
        //print the table
        console.log(table.toString());



    });
    } else {
        console.log('Not a valid market.')
    }
}