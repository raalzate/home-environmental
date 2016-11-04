var express = require('express');
var bodyParser = require("body-parser");
var helperDB = require('./lib/helperDB');
var helperMQTT = require('./lib/helperMQTT');
var onMessageMQTT = require('./lib/onMessageMQTT');

var app = express();
var globalSocket = {};

var repository = new helperDB();
var serverMQTT = new helperMQTT();

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
 
serverMQTT.connect(function(clientMQTT) {
    //register subscribe sensor
    clientMQTT.subscribe("register");

    //load todos los registros para suscribirse 
    repository.getRegisterNodes(function(err, result) {
        if (!err) {
            for (index in result) {
                console.log("subscribe " + result[index].name.toLowerCase());
                clientMQTT.subscribe(result[index].name.toLowerCase());
            }
            //iniciar observadores
            observerEnvironmental(clientMQTT);
        }
    });
});

/**
 * Esta funcion se encarga de observar los nodos
 */
function observerEnvironmental(clientMQTT) {
    serverMQTT.observer(function(topic, value) {
        if (topic == "register") {
            //es un register (node)
            insertNodeRegister(clientMQTT, value);
            console.log('Publish data register');
        } else {
            //es un data del nodo
            insertSensorData(topic, value);
            console.log('Publish data sensor');
        }
    }); //observer
}

/**
 * esta funcion inserta un nuevo nodo y se suscribe al nodo registrado
 * igualmente notifica el nuevo registro al socket
 */
function insertNodeRegister(clientMQTT, value) {
    console.log(value.toString());
    console.log("*********************");

    var objectData = JSON.parse(value.toString());
    var sensors = objectData.sensors;

    var dataInfo = {
        name: objectData.name,
        sensors: sensors.split(','),
        intoDate: new Date()
    };

    repository.insertRegisterNode(dataInfo, function(err, result) {
        if (!err) {
            console.log("new subscribe " + dataInfo.name.toLowerCase());
            clientMQTT.subscribe(dataInfo.name.toLowerCase());
            notifyRegister(dataInfo);
        }
    });

}

/**
 * esta funcion se encarga de registrar la data
 */
function insertSensorData(topic, value, resDB) {
    console.log(value.toString());
    console.log("*********************");
    var objectData = JSON.parse(value.toString());

    var dataInfo = {
        name: topic.toString().toLowerCase(),
        intoDate: new Date(),
        data: objectData,
        node: topic
    };

    repository.insertDataSensor(dataInfo, function(err, result) {
        if (!err) {
            notifyData(dataInfo);
        }
    });
}

/**
 * esta funcion se encarga de notifica la data a los sockets
 */
function notifyData(dataInfo) {
    //pregunta si tiene sockets
    if (Object.keys(globalSocket).length > 0) {
        //consulta todos los sockets
        for (var id in globalSocket) {
            globalSocket[id].emit('pushData', dataInfo);
            console.log("pushData ", dataInfo);
        }
    }
}
/**
 * esta funcion se encarga de notifica el nuevo registro a los sockets
 */
function notifyAllRegister() {
    repository.getRegisterNodes(function(err, result) {
        if (!err) {
            for (index in result) {
                 notifyRegister(result[index]);
            }
        }
    });

}

function notifyRegister(dataInto) {
    //pregunta si tiene sockets
    var skIndex = Object.keys(globalSocket).length;
    console.log("Clientes conectados "+skIndex);
    if (skIndex > 0) {
        Object.keys(globalSocket).forEach(function(id) {
            globalSocket[id].emit('setDataRegisters', dataInto);
        });
    }
}

app.get('/', function(req, res) {
    res.render("page");
});

app.get('/charts', function(req, res) {
    res.render("charts");
    notifyAllRegister();
});

app.get('/rest/sensors', function(req, res) {
    /*repository.connect(function(response) {
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
    });*/
});

//io Socket
var io = require('socket.io').listen(app.listen(3300, function() { //listener
    console.log('Example app listening on port 3300!');
}));
io.sockets.on('connection', function(socket) {
    globalSocket[socket.id] = socket; //set global socket
    console.log('conectado al socket ' + socket.id);
    notifyAllRegister();
    socket.on("disconnect", function() {
        console.log('disconnect del socket ' + socket.id);
        delete globalSocket[socket.id];
    });  
});