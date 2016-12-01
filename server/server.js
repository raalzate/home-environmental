var express = require('express');
var bodyParser = require("body-parser");
var helperDB = require('./src/helperDB');
var helperMQTT = require('./src/helperMQTT');
var onMessageMQTT = require('./src/onMessageMQTT');

var app = express();
var globalSocket = {};

var repository = new helperDB();
var serverMQTT = new helperMQTT();

app.set('views', __dirname + '/src/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
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


/**
 * Esta funcion se encarga de conectarse al servidor MQTT y 
 * suscribir el nodo que esta en la coleccion COLL_NODE_REGISTER
 */
 
serverMQTT.connect(function(clientMQTT) {

    //iniciar observadores
    observerEnvironmental(clientMQTT);
    clientMQTT.subscribe("register");

    //load todos los registros para suscribirse 
    repository.getRegisterNodes(function(err, result) {
        if (!err) {
            for (index in result) {
                console.log("subscribe los sensores del nodo" + result[index].name.toLowerCase());
                //subscibe los sensores del nodo
                for(key in result[index].sensors){
                    var sensor = result[index].sensors[key];
                    clientMQTT.subscribe(result[index].name+"/"+sensor);
                }
            }
        }
    });
});

/**
 * Esta funcion se encarga de observar los nodos
 */
function observerEnvironmental(clientMQTT) {
    serverMQTT.observer(function(topic, value) {
        var expreg = /register\/*/;
    
        if(topic == "register"){
            console.log("--- NUEVO REGISTER ---");
            console.log("register/"+value);
            //realiza el registro del nodo nuevo
            clientMQTT.subscribe("register/"+value);
        }else if (expreg.test(topic)) {
            //es un register (node)
            insertNodeRegister(clientMQTT, topic, value);
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
function insertNodeRegister(clientMQTT, topic, value) {
    console.log(topic+" : "+value);
    console.log("*********************");

    var sensors = value.toString();

    var dataInfo = {
        name: topic.split("/")[1],
        sensors: sensors.split(','),
        intoDate: new Date()
    };

    repository.insertRegisterNode(dataInfo, function(err, result) {
        if (!err) {
            console.log("unsubscribe " + topic);
            clientMQTT.unsubscribe(topic);

            //subscibe los sensores del nodo
            for(key in dataInfo.sensors){
                var sensor = dataInfo.sensors[key];
                console.log("-- sensor subscribe : " + dataInfo.name+"/"+sensor);
                clientMQTT.subscribe(dataInfo.name+"/"+sensor);
            }
            notifyRegister(dataInfo);
        }
    });

}

/**
 * esta funcion se encarga de registrar la data
 */
function insertSensorData(topic, value) {
    console.log(topic+" : "+value);
    console.log("*********************");

    var dataInfo = {
        name: topic.split("/")[1],
        node: topic.split("/")[0],
        intoDate: new Date(),
        data: value.toString()
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

app.get('/charts/:node', function(req, res) {
    res.render("charts-node");
});

app.get('/rest/data/:nodo', function(req, res) {
    console.log(req.params.nodo);
   repository.getDataSensors(req.params.nodo, function(err, result){
        if (err) res.send(500, err.message);
        else res.status(200).jsonp(result);
    });
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