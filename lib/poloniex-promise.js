var zzz = require('poloniex.js');
var Promise = require("bluebird");
var apiKey = process.env.POLONIEX_API_KEY;
var secret = process.env.POLONIEX_API_SECRET;

var poloniex = {};

module.exports = poloniexPromise;


function poloniexPromise(){

    poloniex = new zzz(apiKey,secret);

    return {
        returnTicker: returnTicker,
        returnBalances: returnBalances,
        returnCompleteBalances: returnCompleteBalances,
        returnOpenOrders: returnOpenOrders,
        returnAllOpenOrders: returnAllOpenOrders,
        sell: sell,
        buy: buy,
        cancel: cancel
    }
}




function returnTicker(){
   return new Promise(function(resolve,reject){
      return poloniex.returnTicker(function(err,data){
         if(err){
            reject(err)
         } else {
            resolve(data);
         }
      });
   });
}

function returnBalances(){
   return new Promise(function(resolve,reject){
      return poloniex.returnBalances(function(err,data){
         if(err){
            reject(err)
         } else {
            resolve(data);
         }
      });
   });
}

function returnCompleteBalances(){
   return new Promise(function(resolve,reject){
      return poloniex.returnCompleteBalances(function(err,data){
         if(err){
            reject(err)
         } else {
            resolve(data);
         }
      });
   });
}

function returnOpenOrders(currencyA, currencyB){
   return new Promise(function(resolve,reject){
      return poloniex.returnOpenOrders(currencyA, currencyB, function(err,data){
         if(err){
            reject(err)
         } else {
            resolve(data);
         }
      });
   });
}

function returnAllOpenOrders(currencyA, currencyB){
   return new Promise(function(resolve,reject){
      return poloniex.returnAllOpenOrders(function(err,data){
         if(err){
            reject(err)
         } else {
            resolve(data);
         }
      });
   });
}

function sell(currencyA, currencyB, rate, amount){
   return new Promise(function(resolve,reject){
      return poloniex.sell(currencyA, currencyB, rate, amount, function(err,data){
         if(err){
            reject(err)
         } else {
            resolve(data);
         }
      });
   });
}

function buy(currencyA, currencyB, rate, amount){
   return new Promise(function(resolve,reject){
      return poloniex.buy(currencyA, currencyB, rate, amount, function(err,data){
         if(err){
            reject(err)
         } else {
            resolve(data);
         }
      });
   });
}

function cancel(orderNumber){
   return new Promise(function(resolve,reject){
      return poloniex.cancelOrder('BTC','ETH',orderNumber, function(err,data){
         if(err){
            reject(err)
         } else {
            resolve(data);
         }
      });
   });
}