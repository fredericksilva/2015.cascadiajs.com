var config = require('./config.json'),
    client = require('../node_modules/twilio')(config.twilio.accountSid, config.twilio.authToken),
    qs = require('querystring'),
    http = require('http');

var fromOrganizer = false;

http.createServer(function (request, response) {
    var post = ''

    request.on('data', function (data) {
      post += data;

      if (post.length > 1e6) {
        request.connection.destroy();
      }

      post = qs.parse(post);

      console.log(post);

      var from = post.From,
          sms = post.Body,
          to = config.numbers;

        fromOrganizer = config.numbers.indexOf(from) > -1;

        if(fromOrganizer) {
          to = to.filter(function (value) {
            return from != value;
          });

          var found = sms.match(/to:(\+[0-9]{11})\s?/i);
          console.log(found);
          if(found) {
            sms = sms.replace(found[0], '');
            to.push(found[1]);
          }
        }
        else {
          sms = 'From:' + from + ' ' + sms;
        }

        console.log("From: ", from);
        console.log("To: ", to);
        console.log("SMS: ", sms);

        to.forEach(function (number) {
          sendSMS(number, sms);
        });

        var output = '';

        if(!fromOrganizer) {
          output = autoResponder();
        }

        response.writeHead(200, {
            'Content-Type': 'text/xml',
            'Access-Control-Allow-Origin' : '*'
        });
        response.end(output);
    });

    var output = '<?xml version="1.0" encoding="UTF-8"?>' + "\n";
    response.end(output);
}).listen(80);

function sendSMS(to, message) {
  console.log("[INFO] " + Date.now() + " Sending SMS to " + to);
  return client.messages.create({
      body: message,
      to: to,
      from: config.twilio.number
  }, function(err, message) {
      // process.stdout.write(message.sid);
  });
}

function autoResponder() {
  var output = '';

  output += '<?xml version="1.0" encoding="UTF-8"?>' + "\n";
  output += '<!-- ' + Date.now() + ' -->' + "\n";
  output += '<Response>' + "\n";
  output += '  <Message>CASCADIAFEST Code of Conduct Responder: We\'ve received your message and will respond ASAP.</Message>' + "\n";
  output += '</Response>' + "\n";

  return output;
}