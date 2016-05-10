var mongodb = require('mongodb');
var mqtt = require('mqtt');
var express = require('express');

var app = express();

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
    this.observer = function (db) {
        var client = this.getClient();
        client.on('message', function (topic, message) {
            // message is Buffer
            console.log(message.toString());
           // client.end();
        });
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
var environmentalDB = new HelperDB();
//instance mqtt
var environmentalMQTT = new HelperMQTT();

/**
 * Routing to register visitors
 */
app.get('/', function (req, res) {
    
    environmentalMQTT.connect();//conect with topic
    environmentalDB.connect(function (response) {
        if (response.success) {
            environmentalMQTT.observer(response.db);
            res.send("Revisar consola!!");
        } else { //exists problems in conection form helperDB
            res.send("Error en la conexion a la DB");
        }
    });
});


app.listen(3300, function () { //listener
    console.log('Example app listening on port 3300!');
});

