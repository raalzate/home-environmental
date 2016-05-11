var mongodb = require('mongodb');
var mqtt = require('mqtt');
var express = require('express');
var app = express();

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));


//funcion to manager mqtt
function HelperMQTT() {
  
    this.url = 'mqtt://localhost';//this url of mosquitto
    this.client = null;
  
    this.getClient = function () {
      if(!this.client)  
         this.client = mqtt.connect(this.url);
       return this.client;
    };
    
    this.connect = function () {
        var client = this.getClient();
        client.on('connect', function () {
            client.subscribe('debug');
            //client.publish('debug', 'Hello mqtt');
        });
    };
    this.observer = function (callback) {
        var client = this.getClient();
        client.on('message', callback);
    };
}

//funcion to manager db
function HelperDB() {
    this.url = 'mongodb://localhost:27017/environmental';
    this.connect = function (callback) {
        mongodb.MongoClient.connect(this.url, function (err, db) {
            if (err) {
                callback({"success": false});
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                callback({"success": true, "db": db});
                console.log('Connection established');
            }
        });
    };
}


//instance db
var environmentalDB   = new HelperDB();
//instance mqtt
var environmentalMQTT = new HelperMQTT();

/**
 * Routing to consoler client MQTT
 */
app.get('/', function (req, res) {
    res.render("page");

    io.sockets.on('connection', function (socket) {
        environmentalMQTT.connect();//conect with topic
        environmentalDB.connect(function (response) {
            if (response.success) {
                environmentalMQTT.observer(function (topic, message) {
                    console.log(message.toString());
                     socket.emit('message', { message: message.toString() });
                });//observer
                
            } else { //exists problems in conection form helperDB
                console.log('Error helperDB!');
            }
        });//environmentalDB

    });

});

//io Socket
var io = require('socket.io').listen(app.listen(3300, function () { //listener
    console.log('Example app listening on port 3300!');
}));

