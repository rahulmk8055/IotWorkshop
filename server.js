// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var appWs = require('express-ws')(app);

class Clients {
    constructor(){
      this.clientList = {};
      this.saveClient = this.saveClient.bind(this);
    }
    saveClient(macid, client) {
      this.clientList[macid] = client
    }
  }

  const clients = new Clients();



app.ws('/', function(ws, req) {
    ws.on('message', function(msg) {
      console.log(msg)
      const parsedMsg = JSON.parse(msg);
      console.log(parsedMsg.macId)
      clients.saveClient(parsedMsg.macId,ws)
     
    });
    console.log('socket', req.testing);
  });
  
  
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

const deviceMap = new Map();

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here
router.route('/device').post(function(req, res){

    console.log(req.body.a);

    var macId = req.body.macId;
    var device_name = req.body.deviceName;
    var state  = req.body.state;

    if (deviceMap.get(macId)!= undefined){
        var temp = deviceMap.get(macId);
        temp.set(device_name,state)
    } else {
        const map2 = new Map();
        map2.set(device_name,state)
        deviceMap.set(macId,map2)
    }
    res.json({ message: 'Device updated' });

    
})

router.route('/device').get(function(req, res){

    var macId = req.body.macId;
    object = {};
    console.log(deviceMap.get(macId))
    var results = deviceMap.get(macId);

    let obj = {};
    if (results != undefined){
    results.forEach(function(value, key){
        obj[key] = value
        });
    }
    res.json(obj);

})

router.route('/sendMessage').post(function(req, res){

    console.log(req.body);

    var macId = req.body.macId;
    var device_name = req.body.deviceName;
    var state  = req.body.state;

    let obj = {
        macId : macId,
        device_name : device_name,
        state : state
    }
    if (clients.clientList[macId] != undefined){
        if (clients.clientList[macId].readyState == 1){
            clients.clientList[macId].send(JSON.stringify(obj));
        } else {
            res.json("websocket disconnected")
            return
        }
    res.json("message sent")
    return
    } else {
        res.json("websocket connection does not exist")
    }


    
})

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