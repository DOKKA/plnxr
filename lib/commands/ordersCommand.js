var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

var poloniexPromise = require('../poloniex-promise')();

module.exports = ordersCommand;

function ordersCommand(argv){

    // var currencyPair = argv.currencyPair.toUpperCase();
    // var currArr = currencyPair.split('_');
    // var baseCurrency = currArr[0];
    // var tradeCurrency = currArr[1];
    poloniexPromise.returnAllOpenOrders().then(function(data){
        console.log(data);
    });
}