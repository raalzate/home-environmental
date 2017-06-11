var express = require('express');
var bodyParser = require("body-parser");
var prompt = require('prompt');

var helperDB = require('./src/helperDB');
var helperMQTT = require('./src/helperMQTT');
var onMessageMQTT = require('./src/onMessageMQTT');

var app = express();
var globalSocket = {};

var repository = new helperDB();
var serverMQTT = new helperMQTT();

app.set('views', __dirname + '/src/views');
app.set('view engine', "pug");
app.engine('pug', require('pug').__express);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }
    var $ = require("jquery")(window);
});

prompt.start();


prompt.get(['title', 'location', 'logs'], function(errParams, params) {

    /**
     * Esta funcion se encarga de conectarse al servidor MQTT y 
     * suscribir el nodo que esta en la coleccion COLL_NODE_REGISTER
     */

    serverMQTT.connect(function(clientMQTT) {

        //iniciar observadores
        observerEnvironmental(params, clientMQTT, serverMQTT);
        clientMQTT.subscribe("register");

        //load todos los registros para suscribirse 
        repository.getRegisterNodes(function(err, result) {
            if (!err) {
                for (index in result) {
                    if (params.logs == 1 || params.logs == 'true') {
                        console.log("@@ subscribe los sensores del nodo" + result[index].name.toLowerCase());
                    }
                    //subscibe los sensores del nodo
                    for (key in result[index].sensors) {
                        var sensor = result[index].sensors[key];
                        clientMQTT.subscribe(result[index].name + "/" + sensor);
                    }
                }
            }
        });
    });


    app.get('/', function(req, res) {
        var queryParam = req.query;
        if (Object.keys(queryParam).length == 0) {
            res.render("charts", {
                title: params.title,
                location: params.location
            });
            notifyAllRegister(params);
        } else {
            res.render("charts-node", {
                title: params.title
            });
        }

    });
    app.get('/console', function(req, res) {
        res.render("console", {
            title: params.title,
            subtitule: ""
        });
    });
    app.get('/console/:node/:sensor', function(req, res) {
        res.render("console", {
            title: params.title,
            subtitule: req.params.node + " - " + req.params.sensor
        });
    });
    app.get('/console/:node', function(req, res) {
        res.render("console", {
            title: params.title,
            subtitule: req.params.node
        });
    });

    app.get('/rest/data/:nodo', function(req, res) {
        repository.getDataSensors(req.params.nodo, function(err, result) {
            if (err) res.send(500, err.message);
            else res.status(200).jsonp(result);
        });
    });

    app.get('/rest/data/:nodo/:sensor', function(req, res) {
        repository.getDataBySensor(req.params.nodo, req.params.sensor, function(err, result) {
            if (err) res.send(500, err.message);
            else res.status(200).jsonp(result);
        });
    });

    //io Socket
    var io = require('socket.io').listen(app.listen(3300, function() { //listener
        console.log('Home Environmental app listening on port 3300!');
    }));

    io.sockets.on('connection', function(socket) {
        globalSocket[socket.id] = socket; //set global socket
        if (params.logs == 1) {
            console.log('conectado al socket ' + socket.id);
        }
        notifyAllRegister(params);
        socket.on("disconnect", function() {
            if (params.logs == 1) {
                console.log('disconnect del socket ' + socket.id);
            }
            delete globalSocket[socket.id];
        });
    });

});



/**
 * Esta funcion se encarga de observar los nodos
 */
function observerEnvironmental(params, clientMQTT, serverMQTT) {
    serverMQTT.observer(function(topic, value) {
        var expreg = /register\/*/;

        if (topic == "register") {
            if (params.logs == 1 || params.logs == 'true') {
                console.log("--- NUEVO REGISTER ---");
                console.log("register/" + value);
            }
            //realiza el registro del nodo nuevo
            clientMQTT.subscribe("register/" + value);
        } else if (expreg.test(topic)) {
            //es un register (node)
            insertNodeRegister(params,clientMQTT, topic, value);
            if (params.logs == 1 || params.logs == 'true') {
                console.log('Publish data register');
            }
        } else {
            //es un data del nodo
            insertSensorData(params, topic, value);
            if (params.logs == 1 || params.logs == 'true') {
                console.log('Publish data sensor');
            }
        }
    }); //observer
}


/**
 * esta funcion inserta un nuevo nodo y se suscribe al nodo registrado
 * igualmente notifica el nuevo registro al socket
 */
function insertNodeRegister(params, clientMQTT, topic, value) {
    if (params.logs == 1 || params.logs == 'true') {
        console.log(topic + " : " + value);
        console.log("*********************");
    }
    var sensors = value.toString();

    var dataInfo = {
        name: topic.split("/")[1],
        sensors: sensors.split(','),
        intoDate: new Date()
    };

    repository.insertRegisterNode(dataInfo, function(err, result) {
        if (!err) {
            if (params.logs == 1 || params.logs == 'true') {
                console.log("@@ unsubscribe " + topic);
            }
            clientMQTT.unsubscribe(topic);

            //subscibe los sensores del nodo
            for (key in dataInfo.sensors) {
                var sensor = dataInfo.sensors[key];
                if (params.logs == 1 || params.logs == 'true') {
                    console.log("-- sensor subscribe : " + dataInfo.name + "/" + sensor);
                }
                clientMQTT.subscribe(dataInfo.name + "/" + sensor);
            }
            notifyRegister(params, dataInfo);
        }
    });

}

/**
 * esta funcion se encarga de registrar la data
 */
function insertSensorData(params, topic, value) {
    if (params.logs == 1 || params.logs == 'true') {
        console.log(topic + " : " + value);
        console.log("*********************");
    }

    var dataInfo = {
        name: topic.split("/")[1],
        node: topic.split("/")[0],
        intoDate: new Date(),
        data: value.toString()
    };

    repository.insertDataSensor(dataInfo, function(err, result) {
        if (!err) {
            notifyData(params,dataInfo);
        }
    });
}

/**
 * esta funcion se encarga de notifica la data a los sockets
 */
function notifyData(params, dataInfo) {
    //pregunta si tiene sockets
    if (Object.keys(globalSocket).length > 0) {
        //consulta todos los sockets
        for (var id in globalSocket) {
            globalSocket[id].emit('pushData', dataInfo);
            if (params.logs == 1 || params.logs == 'true') {
                console.log("pushData ", dataInfo);
            }
        }
    }
}
/**
 * esta funcion se encarga de notifica el nuevo registro a los sockets
 */
function notifyAllRegister(params) {
    repository.getRegisterNodes(function(err, result) {
        if (!err) {
            for (index in result) {
                notifyRegister(params, result[index]);
            }
        }
    });

}

function notifyRegister(params, dataInto) {
    //pregunta si tiene sockets
    var skIndex = Object.keys(globalSocket).length;
    if (params.logs == 1 || params.logs == 'true') {
        console.log("Clientes conectados " + skIndex);
    }
    if (skIndex > 0) {
        Object.keys(globalSocket).forEach(function(id) {
            globalSocket[id].emit('setDataRegisters', dataInto);
        });
    }
}