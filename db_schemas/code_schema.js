let mongoose = require('mongoose');
let Quote = require('./quote_schema');

let code_schema = new mongoose.Schema({
    codeName: String,
    id: mongoose.Schema.Types.ObjectID,
    memo: Array, //should be changed to array of memo's
    link: mongoose.Schema.Types.Mixed, //should be changed to link object
    color: String,
    quoteRefs: [String],
    userName: String,
});

code_schema.methods.addQuote = function (quote) {
    this.quoteRefs = [...this.quoteRefs, quote];
};

code_schema.methods.removeQuote = function (quoteText) {
    for (let i = 0; i < this.quoteRefs.length; i++){
        if (this.quoteRefs[i].quoteText === quoteText){
            this.quoteRefs.slice(i, 1); //remove element
            break;
        }
    }
};

const Code = mongoose.model("Code", code_schema);

module.exports = {
    code_schema: code_schema,
    Code: Code
};
