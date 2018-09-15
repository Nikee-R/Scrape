// ============= Dependencies ============= //

var mongoose = require("mongoose");
var Note = require("./note");

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
    notes: [{
        type: Schema.Types.ObjectId,
        ref: "note"
    }]
});

// Create article model.
var Article = mongoose.model("Article", ArticleSchema);

// Export
module.exports = Article;