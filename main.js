// import { readFileSync } from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import Binance from "node-binance-api";

// const httpServer = createSecureServer({
//   allowHTTP1: true,
//   key: readFileSync("/path/to/my/key.pem"),
//   cert: readFileSync("/path/to/my/cert.pem")
// });

const httpServer = createServer();

const io = new Server(httpServer, { /* options */ });
const binance = new Binance().options({
    APIKEY: 'BcowSZOzHgWSVIM54dLtelLNH1TQjhHsrJWGuJkvSDk9Oxwqoj3wUovH9uYycZzK',
    APISECRET: 'KwEXmEIuDRshJlhr3DQfGNpm948fsCmHiG0P04vCVb8mVmsiGcZNakG04mWPrcab'
});

// binance.candlesticks("BNBBTC", "5m", (error, ticks, symbol) => {
//     console.info("candlesticks()", ticks);
//     let last_tick = ticks[ticks.length - 1];
//     let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
//     console.info(symbol+" last close: "+close);
//   }, {limit: 500, endTime: 1514764800000});

// binance.websockets.miniTicker(markets => {
//     console.info(markets);
// });

function balance_update(data) {
	console.log("Balance Update");
	for ( let obj of data.B ) {
		let { a:asset, f:available, l:onOrder } = obj;
		if ( available == "0.00000000" ) continue;
		console.log(asset+"\tavailable: "+available+" ("+onOrder+" on order)");
	}
}
function execution_update(data) {
	let { x:executionType, s:symbol, p:price, q:quantity, S:side, o:orderType, i:orderId, X:orderStatus } = data;
	if ( executionType == "NEW" ) {
		if ( orderStatus == "REJECTED" ) {
			console.log("Order Failed! Reason: "+data.r);
		}
		console.log(symbol+" "+side+" "+orderType+" ORDER #"+orderId+" ("+orderStatus+")");
		console.log("..price: "+price+", quantity: "+quantity);
		return;
	}
	//NEW, CANCELED, REPLACED, REJECTED, TRADE, EXPIRED
	console.log(symbol+"\t"+side+" "+executionType+" "+orderType+" ORDER #"+orderId);
}

binance.websockets.userData(balance_update, execution_update);


httpServer.listen(3000);