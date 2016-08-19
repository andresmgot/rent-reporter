'use strict';
const _ = require('lodash');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('results.db');
const date = new Date();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')));

const transporter = nodemailer.createTransport(config.smtpConfig);

module.exports = function() {
  db.all('SELECT * FROM results', [], function(err, q) {
    let mail = 'Hello these are the new matches found today:\n';
    let somethingToMail = false;
    _.each(q, entry => {
      const date2 = new Date(entry.found);
      if (date.getMonth() === date2.getMonth() &&
      date.getDate() === date2.getDate() &&
      date.getHours() === date2.getHours()) {
        mail += `${entry.url}\n`;
        somethingToMail = true;
      }
    });
    // send mail with defined transport object
    if (somethingToMail) {
      console.log('Found new entries, sending mail...');
      config.mailOptions.text = mail;
    } else {
      console.log('No new entries, sending mail anyway ¯\_(ツ)_/¯');
      config.mailOptions.text = 'Hello, no new matches found this time.';
    }
    transporter.sendMail(config.mailOptions, function(error, info) {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: ', info.response);
    });
  });
};
