# plnxr

Command line interface for trading on poloniex.

## Features
+ plnxr accepts percentages for buy/sell amounts and for buy/sell prices. This way, you don't have to type in an exact decimal value for anything.
+ The rates that plnxr uses for the calculations are refreshed on every command. If you make a buy, it uses the lowest ask price in that instant of time. If you make a sell, it uses the highest bid price.
+ The list, balance, and order commands display in nice colored and formatted tables with several sorting options
+ This command saves alot of time. If you add your api keys to the environmental variables, you will rarely have to login to poloniex.
+ There is a --dryRun option for both buying and selling. This means you can use it for estimations and calculations as well as testing the commands before you run them.

## Installation
### Prerequisite

Have Node.js installed
```
npm install -g plnxr
plnxr --help
```

### Configuration

plnxr looks for your api key and secret in the environmental variables
On Windows it's easiest to create an environmental variable for POLONIEX_API_KEY and POLONIEX_API_SECRET under your current user. You will have to restart your computer to have the environmental variables work in Windows.

in linux, add the following lines to the end of your .bashrc or .zshrc
```
export POLONIEX_API_KEY=your-api-key
export POLONIEX_API_SECRET=myreallylongsecret
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
list eth markets: ```plnxr ls eth```  

#### plnxr buy <currencyPair> [args]
buy some coins  
example ```plnxr buy btc-eth -p 10``` use 10% of your bitcoin reserves to buy ethereum  
example ```plnxr buy btc-eth -t 0.5 -r 0.09518962``` buy 0.5 btc worth of ethereum at a rate of 0.09518962  
example ```plnxr buy btc-eth -a 4.2 -r 0.09518962 -d``` buy 4.2 ethereum a rate of 0.09518962 as a dry run  
example ```plnxr buy btc-eth -t 0.5 -l 10 -d``` buy 0.5 btc worth of ethereum a rate of 10% lower than the current ask price  
example ```plnxr buy --help``` get help for the buy command 

#### plnxr sell <currencyPair> [args]
sell some coins  
example ```plnxr sell btc-eth -p 10``` sell 10% of your etherium back to bitcoin at highest bid  
example ```plnxr sell btc-eth -p 10 -l 20``` sell 10% of your etherium back to bitcoin at 20% higher than highest bid

#### plnxr orders [args] 
list open orders  
alias: ord  
example ```plnxr ord```

#### plnxr cancel [args] 
cancel open orders  
alias: rm  
example ```plnxr rm 45234523```

#### plnxr --help
show the help menu

## Disclaimer
This is a dangerous command! Use it at your own risk! I am not responsible for the trades this program makes!  
You should always run it with the --dryRun argument first to get an estimate on your trade.  
I have thouroughly tested these commands with all their options and everything seems fine to me, but if you find an issue, feel free to submit it =)  
If you have any suggestions, feel free to submit them too! 

## License
MIT

### Donate?
If you like this program, feel free to donate some ethereum!  
```0x9C291207Af058dAb43328F87130B52f11Be9A369```