var _ = require('lodash');
var log = require('../core/log.js');

var method = {};

method.init = function() {
    // strat name
    this.name = 'MoonShotAllStars';
    // trend information
    this.trend = 'none';
	this.trend2 = 'none';
    // tulip indicators use this sometimes
    this.requiredHistory = this.tradingAdvisor.historySize;

  // Needed variables  
	this.rsiArray = new Array();
	this.isBuy = true;
	this.isSell = false;
  this.firstTimeTrade = true;
  this.previousBuyAdviceID = '';
  this.currentBuyAdviceID = '';
	
	this.lastMACDHist = -999;

  // define the indicators we need

  this.addTulipIndicator('tulipmacd', 'macd', this.settings.MACD);
	this.addTulipIndicator('tuliprsi', 'rsi', this.settings.RSI);
	this.addTulipIndicator('tulipstoch', 'stoch', this.settings.STOCH);
	
	this.addTalibIndicator('talibmacd', 'macd', this.settings.MACD);
	this.addTalibIndicator('talibrsi', 'rsi', this.settings.RSI);
	this.addTalibIndicator('talibstoch', 'stoch', this.settings.STOCH);
	
	this.addIndicator('macd', 'MACD', this.settings.MACDnative);
	this.addIndicator('rsi', 'RSI', this.settings.RSInative);
}

// what happens on every new candle?
method.update = function() {
  
  // tulip results
  this.tumacd = this.tulipIndicators.tulipmacd.result;
	this.tursi = this.tulipIndicators.tuliprsi.result.result;
	this.tustoch = this.tulipIndicators.tulipstoch.result;
	
	// ta-lib results
	this.tamacd = this.talibIndicators.talibmacd.result;	
	this.tarsi = this.talibIndicators.talibrsi.result;	
	this.tastoch = this.talibIndicators.talibstoch.result;
	
	//native results
	this.macd = this.indicators.macd.result;
	this.rsi = this.indicators.rsi.result;
	this.rsiArray.push(this.rsi); 
	
}
// for debugging purposes log the last
// calculated parameters.
method.log = function(candle) {
    
/* 	var digits = 8;
    var macd = this.indicators.macd;
	var diff = macd.diff;
	var signal = macd.signal.result;
	
 	
 	log.debug(
`---------------------
Tulip MACD: ${this.tumacd.macdHistogram}
Talib MACD: ${this.tamacd['outMACDHist']}
Tulip RSI: ${this.tursi}
Talib RSI: ${this.tarsi['outReal']}
Tulip STOCHK: ${this.tustoch.stochK}
Tulip STOCHD: ${this.tustoch.stochD}
Talib STOCHK: ${this.tastoch['outSlowK']}
Talib STOCHD: ${this.tastoch['outSlowD']}
MACD Native: ${this.macd} // macdiff
RSI Native: ${this.rsi}
RSI Length: ${this.rsiArray.length}
`); 
 
  log.debug('calculated MACDnative properties for candle:');
  log.debug('\t', 'short:', macd.short.result.toFixed(digits));
  log.debug('\t', 'long:', macd.long.result.toFixed(digits));
  log.debug('\t', 'macd:', diff.toFixed(digits));
  log.debug('\t', 'signal:', signal.toFixed(digits));
  log.debug('\t', 'macdiff:', macd.result.toFixed(digits));
  log.debug('\t', 'Candle Time:', candle.start.format()); */
}

method.check = function() {
  var macddiff = this.indicators.macd.result;
  var macdTrend = 'none';
  var rsiTrend = 'none';

  
  if(macddiff > this.settings.thresholds.up) {

    // new trend detected
    if(this.trend.direction !== 'up')
      // reset the state for the new trend
      this.trend = {
        duration: 0,
        persisted: false,
        direction: 'up',
        adviced: false
      };

    this.trend.duration++;

    log.debug('In uptrend since', this.trend.duration, 'candle(s)');

    if(this.trend.duration >= this.settings.thresholds.persistence)
      this.trend.persisted = true;
	
	if(this.trend.persisted && !this.trend.adviced)
      this.trend.adviced = true;

  } else if(macddiff < this.settings.thresholds.down) {

    // new trend detected
    if(this.trend.direction !== 'down')
      // reset the state for the new trend
      this.trend = {
        duration: 0,
        persisted: false,
        direction: 'down',
        adviced: false
      };

    this.trend.duration++;

    log.debug('In downtrend since', this.trend.duration, 'candle(s)');

    if(this.trend.duration >= this.settings.thresholds.persistence)
      this.trend.persisted = true;
  
	 if(this.trend.persisted && !this.trend.adviced)
      this.trend.adviced = true;

  } else {

    log.debug('In no trend');

    // we're not in an up nor in a downtrend
    // but for now we ignore sideways trends
    //
    // read more @link:
    //
    // https://github.com/askmike/gekko/issues/171

    this.trend = {
      direction: 'none',
      duration: 0,
      persisted: false,
      adviced: false
    };

  }
  
  // RSI ******************************
  var rsi = this.indicators.rsi;
  var rsiVal = rsi.result;
  

  if(rsiVal > this.settings.thresholds.high) {

    // new trend detected
    if(this.trend2.direction !== 'high')
      this.trend2 = {
        duration: 0,
        persisted: false,
        direction: 'high',
        adviced: false
      };

    this.trend2.duration++;

    log.debug('In high since', this.trend2.duration, 'candle(s)');

    if(this.trend2.duration >= this.settings.thresholds.persistence)
      this.trend2.persisted = true;
  
	if(this.trend2.persisted && !this.trend2.adviced)
      this.trend2.adviced = true;

  } else if(rsiVal < this.settings.thresholds.low) {

    // new trend detected
    if(this.trend2.direction !== 'low')
      this.trend2 = {
        duration: 0,
        persisted: false,
        direction: 'low',
        adviced: false
      };

    this.trend2.duration++;

    log.debug('In low since', this.trend2.duration, 'candle(s)');

    if(this.trend2.duration >= this.settings.thresholds.persistence)
      this.trend2.persisted = true;
  
	if(this.trend2.persisted && !this.trend2.adviced)
      this.trend2.adviced = true;

  } else {

    log.debug('RSI: In no trend');
    this.trend2 = {
      direction: 'none',
      duration: 0,
      persisted: false,
      adviced: false
    };
  }

 
  if (this.trend.adviced && this.trend2.adviced)
  {
		if ( this.isBuy && (this.trend.direction == 'down') /* && (macddiff < this.lastMACDHist) */ && (this.trend2.direction == 'low')  && (this.tastoch['outSlowK'] < 20)  )
		{
			log.debug('BUY');
			this.isBuy = false;
			this.isSell = true;
			this.advice({
				direction: 'long', // or short
				trigger: { // ignored when direction is not "long"
				type: 'trailingStop',
				trailValue: 40 // or  trailValue: 100
				}
			});
			this.firstTimeTrade = false;
		}else if ( this.isSell && (this.trend.direction == 'up') /* && (macddiff < this.lastMACDHist) */ && (this.trend2.direction == 'high') &&  (this.tastoch['outSlowK'] > 80) && !this.firstTimeTrade )
		{
		  log.debug('SELL');
		  this.isSell = false;
		  this.isBuy = true;
		  this.advice('short');
		}
    /*
    else
    { 
      this.advice();
      log.debug('FAKE SELL');
    }
    */
 }
  log.debug('Last Histogram:', this.lastMACDHist);
  log.debug('isBuy:', this.isBuy);
  log.debug('isSell:', this.isSell);
  
  if (macddiff != null)
	  this.lastMACDHist = macddiff;

}

method.onTrade = function(trade) {
  console.log('trade: ', trade);
  // console.log('trigger event',triggerCreated);

  if (trade.adviceId == this.previousBuyAdviceID)
  {
    log.debug('STOP LOSS EXECUTED');
  }

  if (trade.action == 'buy')
  {  
    this.previousBuyAdviceID = trade.adviceId; 
  }  
}

module.exports = method;
