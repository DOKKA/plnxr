var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

var poloniexPromise = require('../poloniex-promise')();

module.exports = ordersCommand;

function ordersCommand(argv){


    poloniexPromise.returnAllOpenOrders().then(function(marketOrders){
        var orders = [];
        for(var key in marketOrders){
            var market = marketOrders[key];
            market.forEach(function(order) {
                orders.push({
                    market: key,
                    type: order.type,
                    price: parseFloat(order.rate),
                    amount: parseFloat(order.amount),
                    total: parseFloat(order.total),
                    orderNumber: parseInt(order.orderNumber)
                });
            });
        }
        
        var table  = new Table({head: ['Market'.cyan, 'Type'.cyan, 'Price'.cyan, 'Amount'.cyan, 'BTC Value'.cyan, 'Order Number'.cyan]});

        orders.forEach((order)=>{
            var typeColored = order.type === 'sell' ? order.type.yellow : order.type.magenta;
            table.push([order.market,typeColored, order.price,order.amount, order.total, order.orderNumber]);
        });

        console.log(table.toString());
        
    });

}