var mqtt = require('mqtt');


//funcion to manager mqtt
var helperMQTT = function () {
  
    this.url = 'mqtt://localhost';//this url of mosquitto
    this.client = null;
  
    this.getClient = function () {
      if(!this.client)  
         this.client = mqtt.connect(this.url);
       return this.client;
    };
    
    this.connect = function (callback) {
        var client = this.getClient();
        client.on('connect', function () {
            callback(client);
        });
    };
    this.observer = function (callback) {
        var client = this.getClient();
        client.on('message', callback);
    };
}

module.exports = helperMQTT;