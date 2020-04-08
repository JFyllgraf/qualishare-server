const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbUser:HTJCOtJR25povwdT@clusterboi-omexg.azure.mongodb.net/test?retryWrites=true&w=majority";
var mongoose = require('mongoose');

mongoose.connect(uri, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

    console.log("Weconnected");
    let kittySchema = new mongoose.Schema({
        name: String
    });

    kittySchema.methods.speak = function(){
        var greeting = this.name
            ? "meow name is "+ this.name
            : "I don't have a name";
        console.log(greeting);
    }

    //add methods before mongoose.model
    let Kitten = mongoose.model('Kitten', kittySchema);
    let silence = new Kitten({name: 'Silence'});
    let fluffy = new Kitten ({name: "fluffy"});

    silence.save(function (err) {
        if (err){
            console.log(err);
        }
    })
    fluffy.save(function (err) {
        if (err){
            console.log(err);
        }
    })


    //print all kittens
    Kitten.find(function (err, kittens) {
        kittens.map(kitten => {
            kitten.speak();
        })
    })
    mongoose.disconnect(); //instead of mongoose.connection.close()

});

