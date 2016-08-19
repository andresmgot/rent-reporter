'use strict';

var casper = require('casper').create();
var url = casper.cli.get('url');
console.log(url);
var links = [];
function getLinks() {
  links = document.querySelectorAll('a');
  return Array.prototype.map.call(links, function(e) {
    return e.getAttribute('href');
  });
}
casper.start(url);
casper.then(function() {
  // aggregate results for the 'casperjs' search
  links = this.evaluate(getLinks);
});

casper.run(function() {
  // echo results in some pretty fashion
  this.echo(links.join('\n')).exit();
});
