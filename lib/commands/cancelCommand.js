var Promise = require("bluebird");
var yargs = require('yargs');
var _ = require('lodash');
var Table = require('cli-table2');
var colors = require('colors');

var poloniexPromise = require('../poloniex-promise')();

module.exports = cancelCommand;

function cancelCommand(argv){

    poloniexPromise.cancel(argv.orderNumber).then(function(data){
        if(data.success === 1){
            console.log(data.message);
        } else {
            console.log(data.error);
        }
    })

}