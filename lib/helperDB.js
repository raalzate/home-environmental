var mongodb = require('mongodb');

//funcion to manager db
var helperDB = function () {
    this.url = 'mongodb://localhost:27017/environmental';
    this.db = null;
    this.connect = function (callback) {
        
        if(this.db != null) {
          callback({"success": true, "db": this.db});
          return;
        }
        
        var context = this; 
        
        mongodb.MongoClient.connect(this.url, function (err, db) {
            if (err) {
                callback({"success": false});
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                context.db = db;
                callback({"success": true, "db": db});
                console.log('Connection established');
            }
        });
    };

    this.close = function(){
        this.db.close();
        this.db = null;
    }
};

module.exports = helperDB;