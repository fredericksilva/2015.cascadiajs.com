var config = require('./config.json'),
    client = require('../node_modules/twilio')(config.twilio.accountSid, config.twilio.authToken),
    qs = require('querystring'),
    http = require('http');

var from = "+12536512313",
    sms = 'To:+12063564335 test',
    fromOrganizer = config.numbers.indexOf(from) > -1,
    to = config.numbers;

  if(fromOrganizer) {
    to = to.filter(function (value) {
      return from != value;
    });

    var found = sms.match(/to:(\+[0-9]+)\s?/i);
    console.log(found);
    if(found) {
      sms = sms.replace(found[0], '');
    }
  }
  else {
    sms = 'From:' + from + ' ' + sms;
  }

console.log("From: ", from);
console.log("To: ", to);
console.log("SMS: ", sms);