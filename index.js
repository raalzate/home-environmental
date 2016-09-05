
var express        = require('express');
var bodyParser     = require("body-parser");
var helperDB       = require('./lib/helperDB');
var helperMQTT     = require('./lib/helperMQTT');
var onMessageMQTT  = require('./lib/onMessageMQTT');

var app = express();
var globalSocket = {};


var environmentalDB   = new helperDB();
var environmentalMQTT = new helperMQTT();

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json()); 


environmentalMQTT.connect(function(clientMQTT){
  //rgister subscribe sensor
  clientMQTT.subscribe("register");

  environmentalDB.connect(function (resDB) {
        if (resDB.success) {
           var sensor = resDB.db.collection('sensorRegister');

           sensor.find().toArray(function(err, result){
                if(!err) {
                  for(index in result) {
                    console.log("subscribe "+result[index].name.toLowerCase());
                    clientMQTT.subscribe(result[index].name.toLowerCase());
                  }
                  observerEnvironmental(clientMQTT, resDB);
                }
           });
         
        } else { 
            console.log('Error helperDB!');
            res.status(500).jsonp({'error':'Internal Error'});
        }
    });
});

function observerEnvironmental(clientMQTT, resDB){
    environmentalMQTT.observer(function (topic, value) {

            //get collection
            var sensorRegister = resDB.db.collection('sensorRegister');
            var sensor         = resDB.db.collection('sensor');

            if(topic == "register") {//is register

                var dataInto = {
                    name:value.toString(), 
                    intoDate:new Date()
                };

                sensorRegister.insert(dataInto, function(err, result){
                    if(!err) {

                      clientMQTT.subscribe(value.toString().toLowerCase());
                      notifyRegister(sensorRegister);

                    }
                }); 
            } else {//is node

                var dataInto = {
                  name:topic.toString().toLowerCase(), 
                  intoDate:new Date(), 
                  valueSensor:value.toString()
                };
                     
      
                sensor.insert(dataInto, function(err, result){
                    if(!err) {
                      notifySensor(dataInto);
                    }
                }); 
          }                          
    });//observer
}

function notifySensor(dataInto){
  if(Object.keys(globalSocket).length > 0) {
    globalSocket.forEach(function(socket){
        socket.emit('pushSensor', dataInto);
        console.log("sensor ", dataInto);
    });
  }
}

function notifyRegister(sensorRegister){
  if(Object.keys(globalSocket).length > 0) {
    sensorRegister.find().toArray(function(err, result){
        if(!err) {
          globalSocket.forEach(function(socket){
              socket.emit('setSensor', result);
              console.log("register ", result);
          });
        }
    });
  }
}

app.get('/', function (req, res) {
    res.render("page");
});

app.get('/charts', function(req, res){
    res.render("charts");
    io.sockets.on('connection', function (socket) {
        environmentalDB.connect(function (resDB) {
            if (resDB.success) {
                
                globalSocket[socket.id] = socket;//set global socket

                var sensorRegister = resDB.db.collection('sensorRegister');
                notifyRegister(sensorRegister);
                
            } else { //exists problems in conection form helperDB
                console.log('Error helperDB!');
            }
        });//environmentalDB

    });
    io.sockets.on("disconnect", function(socket) {
        delete globalSocket[socket.id];
    });
});

app.get('/rest/sensors', function(req, res){
    environmentalDB.connect(function (response) {
        if (response.success) {
           var sensor = response.db.collection('sensorRegister');
           sensor.find().toArray(function(err, result){
                if(err) res.send(500, err.message);
                else res.status(200).jsonp(result);
           });
        } else { //exists problems in conection form helperDB
            console.log('Error helperDB!');
            res.status(500).jsonp({'error':'Internal Error'});
        }
    });
});

//io Socket
var io = require('socket.io').listen(app.listen(3300, function () { //listener
    console.log('Example app listening on port 3300!');
}));

