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


function calculateLimits(obj){
   var currencyPair = obj.currencyPair;
   var tradeCurrency = obj.tradeCurrency;

   var coinTicker = obj.ticker[currencyPair];
   var coinBalance = parseFloat(obj.buys[currencyPair].amount);
   var last = parseFloat(coinTicker.last);
   var upperPercentage = last * obj.sellLimitHighPercentage;
   var lowerPercentage = last * obj.sellLimitLowPercentage;
   var lowerLimit = last - lowerPercentage;
   var upperLimit = last + upperPercentage;

   obj.limits = {};
   obj.limits[currencyPair] = {
      amount: coinBalance.toFixed(8),
      lower: lowerLimit.toFixed(8),
      upper: upperLimit.toFixed(8)
   };

   return obj;
}

function calculateBuy(obj){
   var currencyPair = obj.currencyPair;
   var tradeCurrency = obj.tradeCurrency;
   var baseCurrency = obj.baseCurrency;

   //get your balance
   var baseBalance = parseFloat(obj.balances[baseCurrency]);
   //use a percentage of it to buy the trade currency
   var baseAmount = baseBalance * obj.baseBuyPercentage;

   var coinTicker = obj.ticker[currencyPair];
   var rate = parseFloat(coinTicker.lowestAsk);

   //you must specify amount as tradeCurrency not baseCurrency
   var amount = baseAmount/rate;

   obj.buys={};
   obj.buys[currencyPair] = {
      baseAmount: baseAmount.toFixed(8),
      amount: amount.toFixed(8),
      rate: rate.toFixed(8)
   };

   return obj;

}

function setSellLimit(obj){
   var currencyPair = obj.currencyPair;
   var tradeCurrency = obj.tradeCurrency;
   var baseCurrency = obj.baseCurrency;

   console.log(obj.limits);
   var limitObj = obj.limits[currencyPair];
   return poloniexPromise.sell(baseCurrency, tradeCurrency,limitObj.upper, limitObj.amount).then(function(data){
      console.log(data);
      return obj;
   });
}

function placeBuy(obj){
   var currencyPair = obj.currencyPair;
   var tradeCurrency = obj.tradeCurrency;
   var baseCurrency = obj.baseCurrency;
   var buyObj = obj.buys[currencyPair];
   return poloniexPromise.buy(baseCurrency, tradeCurrency, buyObj.rate, buyObj.amount).then(function(result){
            var trades = result.resultingTrades
            if(trades && trades.length && trades.length > 0){
                trades.forEach(function(trade){
                    console.log(`Bought ${trade.amount} ${tradeCurrency} at ${trade.rate}`);
                });
            }
      return obj;
   });
}

function setParameters(argv){
   return Promise.all([poloniexPromise.returnBalances(),poloniexPromise.returnTicker()]).then(function(data){
      var obj = {};
      var currArr = argv.currencyPair.split('_');
      var baseCurrency = currArr[0].toUpperCase();
      var tradeCurrency = currArr[1].toUpperCase();
      var baseBuyPercentage = parseFloat( argv.p)/100.0;
      var sellLimitPercentage = parseFloat(argv.l)/100.0;

      obj.baseCurrency = baseCurrency;
      obj.tradeCurrency = tradeCurrency;
      obj.currencyPair = obj.baseCurrency +'_'+obj.tradeCurrency;
      obj.baseBuyPercentage = baseBuyPercentage;
      obj.sellLimitHighPercentage = sellLimitPercentage;
      //this doesn't work yet.
      obj.sellLimitLowPercentage = 0.20;

      obj.balances = data[0];
      obj.ticker = data[1];
      return obj;
   });
}




function buyCommand(argv){
    if(!apiKey || !secret){
    console.log('you must pass an api key and secret to use this command.')
    } else {
        var parameters = setParameters(argv);

        if(argv.l){
            parameters
                .then(calculateBuy)
                .then(placeBuy)
                .then(calculateLimits)
                .then(setSellLimit)
                .then(function(data){
                    console.log('done')
                });

        } else {
            parameters
                .then(calculateBuy)
                .then(placeBuy)
                .then(function(data){
                    console.log('done')
                });

        }
    }
}

