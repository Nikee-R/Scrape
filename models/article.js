// ============= Dependencies ============= //

var mongoose = require("mongoose");
var Note = require("./Note");

// Creates schema.
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    saved: {
        type: Boolean,
        default: false
    },

    date: {
        type: Date,
        default: Date.now
    },
    notes: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }]
});

// Create article model.
var Article = mongoose.model("Article", ArticleSchema);

// Export
module.exports = Article;