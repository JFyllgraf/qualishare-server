var mongoose = require('mongoose');
import Quote from './quote_schema';

let code_schema = new mongoose.Schema({
    name: String,
    id: Schema.Types.ObjectID,
    memo: Array, //should be changed to array of memo's
    link: Schema.Types.Mixed, //should be changed to link object
    color: String,
    quoteRefs: [Quote],

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

const Code = mongoose.model("Quote", code_schema;

module.exports = {
    code_schema: code_schema,
    Code: Code
};