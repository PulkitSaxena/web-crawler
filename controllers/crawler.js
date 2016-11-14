// imports
var EVENTS                      =   require('events'),
    NODE_UTIL                   =   require('util');

/**
 * This defines the constructor for the crawler class
 * param@{Object} config
 */

function Crawler(config){

  // calling event emitter
  EVENTS.EventEmitter.call(this);

  this._config        = config,
  this._maxRequest    = this._config['MAX_CONCURRENT_REQUESTS'],
  this.url            = this._config['URL']

}

NODE_UTIL.inherits(Crawler, EVENTS.EventEmitter);

Crawler.prototype.start

// exporting module
module.exports = Crawler;
