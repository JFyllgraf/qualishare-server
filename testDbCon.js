const {quote_schema, Quote} = require('./db_schemas/quote_schema');
const {code_schema, Code} = require('./db_schemas/code_schema');
const mongoose = require('mongoose');

const uri = "mongodb+srv://dbUser:HTJCOtJR25povwdT@clusterboi-omexg.azure.mongodb.net/test?retryWrites=true&w=majority";

let quote1 = new Quote({
    quoteText: "fate fate fate fate fate fate ",
    quoteOffset: 500,
    codeRefs: 1000,
    documentNum: 5,
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
saveQuote(quote1);



async function saveQuote (quote){
    try {
        console.log("before save");
        await quote.save();
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
        mongoose.disconnect();
    }
}

//same function but based on promise
function saveQuotePromise(quote) {
    quote.save().then((saveResult) => {
        console.log(saveResult);
        return Quote.find();
    }).then((result) => {
        console.log(result);
        mongoose.disconnect();
    }).catch(err => {
        if (err) {
            console.log(err);
            mongoose.disconnect();
        }
    })
}
//these functions are now equivalent

//save file to mongodb
function saveFile(){

}

async function showCollections(){
    await console.log(mongoose.connection);

    await mongoose.disconnect();
    await console.log("disconnected");
}



/*
app.post('/upload', (req, res) => {
  if(req.files === null){
    return res.status(400).json({msg:'no file uploaded'});
  }
  const file = req.files.file;
  file.mv(`C:/Users/Ruben/Desktop/uploaded_files/${file.name}`, err => { //this is callback, previous way before promises
    if (err){
      console.error(err);
      return res.status(500).send(err);
    }
    res.json({fileName: file.name, filePath: `/uploaded_files/${file.name}` })
  })
});
 */