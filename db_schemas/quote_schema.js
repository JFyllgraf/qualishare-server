var mongoose = require('mongoose');

const summary_length = 5;

let quote_schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectID,
    quoteText: String,
    quoteOffSet: Number,
    codeRefs: String,
    documentNum: Number
});
quote_schema.methods.getSummary = function () {
    return this.quoteText.match(/([\w]*\s|[\w]*)/gm).splice(0, summary_length).toString()
};

const Quote = new mongoose.model('Quote', quote_schema);

module.exports = {
    quote_schema: quote_schema,
    Quote: Quote
};

//this stuff works

//other schema code
    /*
    let kittySchema = new mongoose.Schema({
        name: String
    });
    */
    /*
    kittySchema.methods.speak = function(){
        var greeting = this.name
            ? "meow name is "+ this.name
            : "I don't have a name";
        console.log(greeting);
    };
     */

//add methods before mongoose.model
//let Kitten = mongoose.model('Kitten', kittySchema);
//let silence = new Kitten({name: 'Silence'});
//let fluffy = new Kitten ({name: "fluffy"});
/*
silence.save(function (err) {
    if (err){
        console.log(err);
    }
});
fluffy.save(function (err) {
    if (err){
        console.log(err);
    }
});
*/