
// local imports
var CRAWLER          = require(__dirname + '/controllers/crawler.js');
var CONF             = require(__dirname + '/conf/serverConf.js');

// creating new instance of site crawler
var siteCrawler      = new CRAWLER(CONF);

// event handler for start event of crawler
siteCrawler.on('start', function(){
  console.log('started crawling');
});

// event handler for end event of crawler
siteCrawler.on('end', function(){
  console.log('ending crawling');
});

// initiating the crawling proccess
siteCrawler.startCrawling();

// Catch all exceptions. 
process.on('uncaughtException', function(e) {
  console.log(e);
});
