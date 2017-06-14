# PLNXR

Command line interface for trading on poloniex.

## Installation
### Prerequisite

Have Node.js installed
```
npm install -g plnxr
plnxr --help
```

### Configuration

plnxr looks for your api key and secret in the environmental variables
On Windows it's easiest to create an environmental variable for API_KEY and API_Secret under your current user.

in linux, add the following lines to the end of your .bashrc or .zshrc
```
export API_KEY=your-api-key
export API_SECRET=myreallylongsecret
```

## Commands
#### plnxr balance [args]
lists your balances  
alias: bal  
example: ```plnxr bal```

#### plnxr list [currency] [args]
lists all markets for a currency  
alias: ls  
example: ```plnxr ls``` (defaults to BTC)  
list usdt markets: ```plnxr ls USDT```

#### plnxr buy <currencyPair> [args]
buy some coins  
example ```plnxr buy BTC_ETH -p 10``` use 10% of your bitcoin reserves to buy ethereum  
be careful with this command. if you forget the -p argument it will buy 100% of the currency you select

#### plnxr sell <currencyPair> [args]
sell some coins  
example ```plnxr sell BTC_ETH -p 10``` sell 10% of your etherium back to bitcoin at highest bid  
example ```plnxr sell BTC_ETH -p 10 -l 20``` sell 10% of your etherium back to bitcoin at 20% higher than highest bid

#### plnxr orders [args] 
list open orders  
alias: ord  
example ```plnxr ord```

#### plnxr --help
show the help menu

## Disclaimer
This is a dangerous command! I am not responsible for the trades this program makes! Use it at your own risk!
Please read through the code and decide for yourself if you should use it! I'm still working on the commands and I want to make this program really nice. 

## Features
+ plnxr accepts percentages for buying and selling and sell limits. This way, you don't have to type in an exact decimal value for anything.
+ the rates that plnxr uses for the calculations are refreshed on every command. If you make a buy, it uses the lowest ask price in that instant of time.
+ the list, balance, and order commands display in nice colored formatted tables with several sorting options
+ This command saves alot of time. If you add your api keys to the environmental variables, you will rarely have to login to poloniex.

## License
MIT

### Donate?
If you like this program, feel free to donate some ethereum!  
```0x9C291207Af058dAb43328F87130B52f11Be9A369```