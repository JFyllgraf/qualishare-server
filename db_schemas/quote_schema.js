var mongoose = require('mongoose');

const summary_length = 5;

let quote_schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectID,
    quoteText: String,
    quoteOffset: {
        start: Number,
        end: Number,
    },
    codeRefs: String,
    documentNum: Number,
    userName: String,
    memo: String,
});
quote_schema.methods.getSummary = function () {
    return this.quoteText.match(/([\w]*\s|[\w]*)/gm).splice(0, summary_length).toString()
};

const Quote = new mongoose.model('Quote', quote_schema);

module.exports = {
    quote_schema: quote_schema,
    Quote: Quote
};