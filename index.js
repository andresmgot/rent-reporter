'use strict';

const _ = require('lodash');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('results.db');
const mail = require('./lib/mail.js');
const fs = require('fs');
const path = require('path');
const webpages = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'))).pages;
const spawnSync = require('child_process').spawnSync;

const parser = function(doc, regexp, c) {
  let refs = [];
  _.each(doc, line => {
    const match = line.match(regexp);
    if (match) {
      refs = refs.concat(match);
    }
  });
  const results = _.uniq(refs);
  c.refs = c.refs + results.length;
  return results;
};

const addEntry = function(domain, url, c, callback) {
  db.run(`INSERT INTO results (domain, url, found) VALUES ('${domain}','${url}', '${new Date()}')`,
  [], function() {
    c.results.push(url);
    if (++c.counter === c.refs && c.webs === webpages.length) {
      callback(c);
    }
  });
};

const filter = function(refs, web, c, callback) {
  _.each(refs, r => {
    db.get(`SELECT * FROM results WHERE url='${web.baseUrl}${r}'`, [], function(err, q) {
      if (_.isUndefined(q)) {
        addEntry(web.baseUrl, `${web.baseUrl}${r}`, c, callback);
      } else {
        if (++c.counter === c.refs && c.webs === webpages.length) {
          callback(c);
        }
      }
    });
  });
};

db.run('CREATE TABLE results (domain string, url string, found string)', function() {
      // Create table if not exists
});

const main = function(callback) {
  const c = {counter: 0, refs: 0, webs: 0, results: []};
  const check = spawnSync('casperjs', ['--version'])
  if (check.status !== 0) {
    throw new Error("Unable to use casperjs:\n" + check.stdout)
  }
  _.each(webpages, web => {
    const webObj = {
      baseUrl: web.match(/^(https?:\/\/[^\/]*)/m)[1],
      uri: web
    };
    console.log(`Checking ${web.substring(0, 100)}...`);
    const links = spawnSync(
        'casperjs', ['./lib/casperRequest.js', `--url=${web}`]
      ).stdout.toString('utf8').split('\n');
    let refs = [];
    if (webObj.baseUrl.match('idealista')) {
      refs = parser(links, /\/inmueble\/[0-9]+\//g, c);
    } else if (webObj.baseUrl.match('enalquiler')) {
      refs = parser(links, /\/alquiler_piso[^\/]*\/[^\.]*\.html/g, c);
    } else if (webObj.baseUrl.match('milanuncios')) {
      refs = parser(links, /\/alquiler-de-pisos[^\/]*\/([a-zA-Z]+-)+[0-9]+.htm/g, c);
    } else if (webObj.baseUrl.match('fotocasa')) {
      refs = parser(links, /\/vivienda\/[^?]*/g, c);
    } else if (webObj.baseUrl.match('vibbo')) {
      refs = parser(links, /\/[^\/]*\/[^\/]*\/a[0-9]+\/[^"]*/g, c);
    } else {
      throw new Error(`${webObj.baseUrl} not supported`);
    }
    c.webs++;
    filter(refs, webObj, c, callback);
  });
};

main(function() {
  mail();
});
