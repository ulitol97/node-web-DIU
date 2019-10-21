module.exports = {
    conexion : async () => {
        var mongo = require("mongodb");
        var db = "mongodb://admin:admin-diu-miw@miw-diu-shard-00-00-tb9ul.mongodb.net:27017,miw-diu-shard-00-01-tb9ul.mongodb.net:27017,miw-diu-shard-00-02-tb9ul.mongodb.net:27017/test?ssl=true&replicaSet=MIW-DIU-shard-0&authSource=admin&retryWrites=true&w=majority";
        promise = new Promise((resolve, reject) => {
            mongo.MongoClient.connect(db, (err, db) => {
                if (err) {
                    resolve(null)
                } else {
                    resolve(db);
                }
            });
        });
        return promise;
    },
    insertarAnuncio : async (db, anuncio) => {
        promise = new Promise((resolve, reject) => {
            var collection = db.collection('anuncios');
            collection.insert(anuncio, (err, result) => {
                if (err) {
                    resolve(null);
                } else {
                    // _id no es un string es un ObjectID
                    resolve(result.ops[0]._id.toString());
                }
                db.close();
            });
        });
        return promise;
    }
}