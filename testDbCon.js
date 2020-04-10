const {quote_schema, Quote} = require('./db_schemas/quote_schema');
const mongoose = require('mongoose');

const uri = "mongodb+srv://dbUser:HTJCOtJR25povwdT@clusterboi-omexg.azure.mongodb.net/test?retryWrites=true&w=majority";

let quote1 = new Quote({
    quoteText: "fate fate fate fate fate fate ",
    quoteOffset: 500,
    codeRefs: 1000
});

try {
    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
}
catch (err) {
    console.log(err)
}
var db = mongoose.connection;
//db.on('error', console.error.bind(console, 'connection error:'));

/*
saveQuote().catch(err=>{
    if(err) {
        console.log(err)
    }
});

 */



saveQuotePromise();

async function saveQuote (){
    try {
        console.log("before save");
        await quote1.save();
        console.log("After save");
        await Quote.find((err, quotes)=>{
            if (err){
                console.log(err);
            }
            else {
                quotes.map(quote => {
                    console.log(quote)
                })
            }
        });
        await mongoose.disconnect();
    }
    catch (err) {
        console.log(err);
    }
}

//same function but based on promise
function saveQuotePromise(){
    quote1.save().then((saveResult) => {
        console.log(saveResult);
        return Quote.find();
    }).then((result) => {
        console.log(result);
        mongoose.disconnect();
    }).catch(err => {
        if (err){
            console.log(err);
        }
    })
}

//these functions are now equivalent