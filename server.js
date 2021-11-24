// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cors = require('cors')
app.use(cors())

var appWs = require('express-ws')(app);
class Clients {
    constructor(){
      this.clientList = {};
      this.registerClient = this.registerClient.bind(this);
    }
    registerClient(macid, client) {
      this.clientList[macid] = client
    }
  }

const clients = new Clients();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

app.ws('/', function(ws, req) {
    ws.on('message', function(msg) {
      console.log(msg)
      const parsedMsg = JSON.parse(msg);
      console.log(parsedMsg.macId)
      clients.registerClient(parsedMsg.macId,ws)
     
    });
    console.log('socket', req.testing);
  });
  

// Main API
router.route('/sendMessage').post(function(req, res){

    console.log(req.body);

    var macId = req.body.macId;
    var state  = req.body.state;

    let obj = {
        macId : macId,
        state : state
    }
    if (clients.clientList[macId] != undefined){
            clients.clientList[macId].send(JSON.stringify(obj));
            res.json("message sent")
            return
    } else {
            res.json("websocket connection does not exist")
    }
})


// Main API
router.route('/connectedDevices').get(function(req, res){

    const keys = Object.keys(clients.clientList); 
    console.log(keys)
    let obj = {
        devies : keys
    };
    res.json(obj);

})

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
// app.use(express.json())

// START THE SERVER
// =============================================================================
server = app.listen(port);
console.log('Magic happens on port ' + port);