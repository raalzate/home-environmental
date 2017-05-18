var mongodb = require('mongodb');

//funcion to manager db
var helperDB = function() {

    var COLL_NODE_REGISTER = 'nodeRegister';
    var COLL_SENSOR_DATA = 'sensorData';

    this.url = 'mongodb://localhost:27017/environmental';
    this.connect = function(callback) {
        mongodb.MongoClient.connect(this.url, function(err, db) {
                if (err) {
                    callback(false, null);
                    console.log('Unable to connect to the mongoDB server. Error:', err);
                } else {
                    console.log('Connection established');
                    callback(true, db);
                }
        });
};

this.getRegisterNodes = function(resultCallback) {
    this.connect(function(status, db) {
        if (status) {
            var nodes = db.collection(COLL_NODE_REGISTER);
            nodes.find().toArray(function(err, result) {
                console.log("consultando los registros de los nodos");
                resultCallback(err, result);
                db.close();
            });
        }
    });
};

this.getDataSensors = function(nodo, resultCallback) {
    this.connect(function(status, db) {
        if (status) {
            var data = db.collection(COLL_SENSOR_DATA);
            data.find({node:nodo, data:{ $ne: "nan" }}).toArray(function(err, result) {
                resultCallback(err, result);
                db.close();
            });
        }
    });
};

this.getDataBySensor = function(nodo, name, resultCallback) {
    this.connect(function(status, db) {
        if (status) {
            var data = db.collection(COLL_SENSOR_DATA);
            data.find({node:nodo, name: name, data:{ $ne: "nan" }}).toArray(function(err, result) {
                resultCallback(err, result);
                db.close();
            });
        }
    });
};

this.insertRegisterNode = function(dataInto, resultCallback) {
    this.connect(function(status, db) {
        if (status) {
            var register = db.collection(COLL_NODE_REGISTER);
            register.insert(dataInto, function(err, result) {
                resultCallback(err, result);
            });
        }
    });
};


this.insertDataSensor = function(dataInto, resultCallback) {
    this.connect(function(status, db) {
        if (status) {
            var register = db.collection(COLL_SENSOR_DATA);
            register.insert(dataInto, function(err, result) {
                resultCallback(err, result);
            });
        }
    });
};
};

module.exports = helperDB;