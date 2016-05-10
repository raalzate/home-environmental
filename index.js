var express = require('express');
var mongodb = require('mongodb');
var app = express();

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

/**
 * Routing to register visitors
 */
app.get('/', function (req, res) {
    environmentalDB.connect(function (response) {
        if (response.success) {
            var collection = response.db.collection('visitor');
            collection.insert({"visitor": 1}, function (err, result) {
                if (err) { //exists error
                    res.send("Error en la coleccion visitor");
                } else {
                    res.send("Visitor OK"); //visitor ok
                }
                console.log('Resultado :', result);
                response.db.close(); //close db 
            });

        } else { //exists problems in conection form helperDB
            res.send("Error en la conexion a la DB");
        }
    });
});


/**
 * Query visitors number total
 */
app.get('/visitors', function (req, res) {
    environmentalDB.connect(function (response) {
        if (response.success) {
            var collection = response.db.collection('visitor');
            collection.find().toArray(function (err, result) {
                if (err) {//exists error
                    res.send("Error en la coleccion visitor");
                } else {
                    res.send("Result OK Total: "+result.length+"");
                }
                console.log('Resultado :', result);
                response.db.close();//close db 
            });

        } else {//exists problems in conection form helperDB
            res.send("Error en la conexion a la DB");
        }
    });
});

app.listen(3000, function () { //listener
    console.log('Example app listening on port 3000!');
});

