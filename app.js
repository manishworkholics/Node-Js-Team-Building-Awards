var express = require('express');
const path = require('path');
const url = require('url');
var http = require('http');
var dateFormat = require("dateformat");
var cookieParser = require('cookie-parser')
var session = require('express-session')
var flash = require('connect-flash');
const cors = require("cors");

const bodyParser = require('body-parser');
var md5 = require('md5');

const dotenv = require('dotenv');
dotenv.config();

//const stripe = require('stripe')('sk_test_51Gg8qCFdM9tFcM97ov7Sq0tWhby5pmKdtj9zHjGOimErcfkgZ207UTXleTNR5Yt1oKeQS9sRSvHMRqj4JV8OEIMx003hHUHuVI');

const stripe = require('stripe')('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');

// Router Prefix Setup
express.application.prefix = express.Router.prefix = function (path, configure) {
    let router = express.Router();
    this.use(path, router);
    configure(router);
    return router;
};

const routes = require('./routes');

const app = express();

var corsOptions = {
    origin: process.env.MAIN_URL
  };
  
//app.use(cors(corsOptions));
app.use(cors({origin: "*"}));


app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

app.use('/', routes);


app.get('/', function (req, res) {
    res.send({connection: true});
    // res.sendFile(__dirname + '/index.html');
});

app.post('/pay', async (request, response) => {
  try {
    // Create the PaymentIntent
    let intent = await stripe.paymentIntents.create({
      payment_method: request.body.payment_method_id,
      description: "New Received Order",
      amount: request.body.amount * 100,
      currency: 'USD',
      confirmation_method: 'manual',
      confirm: true
    });
    // Send the response to the client
    response.send(generateResponse(intent));
  } catch (e) {
    // Display error on client
    return response.send({ error: e.message });
  }
});
  
  const generateResponse = (intent) => {
    if (intent.status === 'succeeded') {
      // The payment didn’t need any additional actions and completed!
      // Handle post-payment fulfillment
      return {
        success: true
      };
    } else {
      // Invalid status
      return {
        error: 'Invalid PaymentIntent status'
      };
    }
  };

const port = process.env.APP_PORT || '3000';

const server = http.createServer(app);

server.listen(port);