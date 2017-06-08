var Promise = require("bluebird");
var yargs = require('yargs');
var apiKey = process.env.API_KEY || argv.key;
var secret = process.env.API_SECRET || argv.secret;
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

//path is relative to bin directory
var poloniexPromise = require('../lib/poloniex-promise')(apiKey,secret);


module.exports = {
    balanceCommand: balanceCommand,
    buyCommand: buyCommand,
    listCommand: listCommand
};

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
   return poloniexPromise.buy(baseCurrency, tradeCurrency, buyObj.rate, buyObj.amount).then(function(data){
      console.log(data);
      return obj;
   });
}

function setParameters(argv){
   return Promise.all([poloniexPromise.returnBalances(),poloniexPromise.returnTicker()]).then(function(data){
      var obj = {};
      var currArr = argv.c.split('_');
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
        return tickerObj.baseCurrency === 'BTC' && _.includes(activeMarkets, tickerObj.tradeCurrency);
    }).mapValues(function(market, key){
        return Object.assign(market, myBalances[market.tradeCurrency]);
    }).value();


    var table  = new Table({head: ['Market'.cyan, 'Price'.cyan, '% Change'.cyan, 'BTC Value'.cyan, 'USD Value'.cyan]});

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

function listCommand(argv){
    var baseCurrency = argv.market;
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



