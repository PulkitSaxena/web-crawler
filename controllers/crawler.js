
// imports
var EVENTS                      = require('events'),
    NODE_UTIL                   = require('util'),
    ASYNC                       = require('async'),
    REQUESTIFY                  = require('requestify'),
    CHEERIO                     = require('cheerio'),
    URL_PARSER                  = require('url-parse');

/**
 * This defines the constructor for the crawler class
 * param@{Object} config
 */

function Crawler(config){

  // calling event emitter
  EVENTS.EventEmitter.call(this);

  this._config              = config,
  this._concurrencyRate     = this._config['MAX_CONCURRENT_REQUESTS'],
  this._url                 = this._config['URL'],
  this._anchorElement       = this._config['ELEMENTS']['ANCHOR'],
  this._origin              = new URL_PARSER(this._url).origin,
  this._boundedCrawlUrl     = this._crawlUrl.bind(this),
  this._taskQueue           = null,
  this._addedLinks          = [],
  this._requestify          = REQUESTIFY

}

// now Crawler object inherits the event emitter
NODE_UTIL.inherits(Crawler, EVENTS.EventEmitter);

/**
 * Starts the overall crawling process and emits the start event to notify the
 * main process
 */

Crawler.prototype.startCrawling               = function(){

  // emitting start event
  this.emit('start');

  // initialize the system
  this._initializeQueue();
},

/**
 * This defines the action corresponding to a task in the async queue of visiting
 * a link
 * param@{Object} task
 * param@{function} callback
 */

Crawler.prototype._crawlUrl                   =  function(task, callback){
  var self  = this
  var url   = task.url;

  this._requestify.get(url)
      .then(function (response) {
         console.log("Visiting:" + url + " Tasks left:" + self._taskQueue.length());
         // parsing the body of the requsted url page
         self._parseBody(response.getBody());
         callback();
      })
      .catch(function (error) {
          if(error)
            callback(self._config['ERROR_VISITING'] + url);
      });

},

/**
* parses the body of the body of the link visited
* @param {Object} body
*/

Crawler.prototype._parseBody                  = function(body){
  var $               = CHEERIO.load(body),
      self            = this,
      links           = [],
      externalLinks;

  // extract all the internal links
  links               = $(this._anchorElement);
  // now add urls to the task queue
  links.each(function(){
    if($(this) && $(this).attr('href'))
      self._pushNewUrlInQueue($(this).attr('href'));
  });

},

/**
* Initializes the whole async queue with the first task of link to start with
*/

Crawler.prototype._initializeQueue            = function(){
  var self  = this;

  // initializing the async queue and with the given concurrency rate
  if(!this._taskQueue){
    this._taskQueue     = ASYNC.queue(this._boundedCrawlUrl, this._concurrencyRate);

    // the function to be called when last task is executed
    this._taskQueue.drain = function(err){
      if(err)
        console.log(err);

       // end the crawling process
       self._stopCrawling();
    };

    // initialize the array with the header for CSV conversion
    this._addedLinks.push(this._config['CSV_HEADING']);

    // pushing the first task in queue
    this._pushNewUrlInQueue(this._url);

  }

},

/**
* adds a new url into the queue of tasks to be executed
* @param {String} link
*/

Crawler.prototype._pushNewUrlInQueue           = function(link){
  var urlObject   = new URL_PARSER(link);

  // checking if the coming link is not already visited and belongs to the same origin
  if(link && this._addedLinks.indexOf(link) == -1 && this._origin == urlObject.origin){

    // adding new task for given url in queue
    this._taskQueue.push({url: link},function(err){
      if(err){
        console.log(err)
      }
    });
    this._addedLinks.push(link);
  }

},

/**
* emits the end event of the crawling
* @param {String} link
*/

Crawler.prototype._stopCrawling               = function(){
  // data to be passed on
  var crawlerData   = {
      linksVisited      : this._addedLinks,
      linksCount        : this._addedLinks.length,
      fileName          : new URL_PARSER(this._url).hostname
  }
  // emitting end event
  this.emit('end', crawlerData);

};


// exporting module
module.exports = Crawler;
