var express = require('express');
var bodyParser = require("body-parser");
var helperDB = require('./lib/helperDB');
var helperMQTT = require('./lib/helperMQTT');
var onMessageMQTT = require('./lib/onMessageMQTT');

var app = express();
var globalSocket = {};


var COLL_NODE_REGISTER = 'nodeRegister';
var COLL_SENSOR_DATA = 'sensorData';

var environmentalDB = new helperDB();
var environmentalMQTT = new helperMQTT();

app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


/**
 * Esta funcion se encarga de conectarse al servidor MQTT y 
 * suscribir el nodo que esta en la coleccion COLL_NODE_REGISTER
 */
environmentalMQTT.connect(function(clientMQTT) {
    //register subscribe sensor
    clientMQTT.subscribe("register");

    environmentalDB.connect(function(resDB) {
        if (resDB.success) {
            var nodes = resDB.db.collection(COLL_NODE_REGISTER);

            nodes.find().toArray(function(err, result) {
                if (!err) {
                    for (index in result) {
                        console.log("subscribe " + result[index].name.toLowerCase());
                        clientMQTT.subscribe(result[index].name.toLowerCase());
                    }
                    //iniciar observadores
                    observerEnvironmental(clientMQTT, resDB);
                }
            });

        } else {
            console.log('Error helperDB!');
            res.status(500).jsonp({
                'error': 'Internal Error'
            });
        }
    });
});

/**
 * Esta funcion se encarga de observar los nodos
 */
function observerEnvironmental(clientMQTT, resDB) {
    environmentalMQTT.observer(function(topic, value) {
        if (topic == "register") {
            //es un register (node)
            insertNodeRegister(clientMQTT, value, resDB);
            console.log('Publish data register', value);
        } else {
            //es un data del nodo
            insertSensorData(topic, value, resDB);
            console.log('Publish data topic', value);
        }
    }); //observer
}

/**
 * esta funcion inserta un nuevo nodo y se suscribe al nodo registrado
 * igualmente notifica el nuevo registro al socket
 */
function insertNodeRegister(clientMQTT, value, resDB) {
    var nodeRegister = resDB.db.collection(COLL_NODE_REGISTER);
    var objectData = JSON.parse(value.toString());
    var sensors = objectData.sensors;
    console.log(objectData);

    var dataInto = {
        name: objectData.name,
        sensors:sensors.split(','),
        intoDate: new Date()
    };

    nodeRegister.insert(dataInto, function(err, result) {
        if (!err) {
            clientMQTT.subscribe(value.toString().toLowerCase());
            notifyRegister(nodeRegister);
        }
    });
}

/**
 * esta funcion se encarga de registrar la data
 */
function insertSensorData(topic, value, resDB) {
    var sensorData = resDB.db.collection(COLL_SENSOR_DATA);
    var objectData = JSON.parse(value.toString());

    var dataInto = {
        name: topic.toString().toLowerCase(),
        intoDate: new Date(),
        data: objectData,
        node: topic
    };

    sensorData.insert(dataInto, function(err, result) {
        if (!err) {
            notifyData(dataInto);
        }
    });
}

/**
 * esta funcion se encarga de notifica la data a los sockets
 */
function notifyData(dataInto) {
    //pregunta si tiene sockets
    if (Object.keys(globalSocket).length > 0) {
        //consulta todos los sockets
        for (var id in globalSocket) {
            globalSocket[id].emit('pushData', dataInto);
            console.log("pushData ", dataInto);
        }
    }
}
/**
 * esta funcion se encarga de notifica el nuevo registro a los sockets
 */
function notifyRegister(sensorRegister) {
    //pregunta si tiene sockets
    if (Object.keys(globalSocket).length > 0) {
        console.log("Clientes sockets "+Object.keys(globalSocket).length)
        sensorRegister.find().toArray(function(err, result) {
            if (!err) {
              console.log('*** globalSocket ');
              Object.keys(globalSocket).forEach(function(id) {
                  console.log('-- Cliente '+id);
                  globalSocket[id].emit('setDataRegisters', result);
              });
                  
            }
        });
    }
}

app.get('/', function(req, res) {
    res.render("page");
});

app.get('/charts', function(req, res) {
    res.render("charts");
    io.sockets.on('connection', function(socket) {

        globalSocket[socket.id] = socket; //set global socket
        console.log('conectado al socket '+socket.id);
        socket.on("disconnect", function() {
          console.log('disconnect del socket '+socket.id);
          delete globalSocket[socket.id];
        });

        environmentalDB.connect(function(resDB) {
            if (resDB.success) {
                var sensorRegister = resDB.db.collection(COLL_NODE_REGISTER);
                notifyRegister(sensorRegister);
            } else {
                //existe probelmas
                console.log('Error helperDB!');
            }
        }); //environmentalDB

       

    });
    io.sockets.on("disconnect", function(socket) {
        console.log('disconnect del socket');
        delete globalSocket[socket.id];
        console.log("** Clientes sockets "+Object.keys(globalSocket).length)

    });
});

app.get('/rest/sensors', function(req, res) {
    environmentalDB.connect(function(response) {
        if (response.success) {
            var sensor = response.db.collection('sensorRegister');
            sensor.find().toArray(function(err, result) {
                if (err) res.send(500, err.message);
                else res.status(200).jsonp(result);
            });
        } else { //exists problems in conection form helperDB
            console.log('Error helperDB!');
            res.status(500).jsonp({
                'error': 'Internal Error'
            });
        }
    });
});

//io Socket
var io = require('socket.io').listen(app.listen(3300, function() { //listener
    console.log('Example app listening on port 3300!');
}));