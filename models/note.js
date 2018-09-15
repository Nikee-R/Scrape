// ============= Dependencies ============= //

var mongoose = require("mongoose");

// Creates Schema.
var Schema = mongoose.Schema;

// Create note schema.
var NoteSchema = new Schema({
    body: {
        type: String
    },
    article: {
        type: Schema.Types.ObjectId,
        ref: "article"
    }
});

// Create note model.
var Note = mongoose.model("Note", NoteSchema);

// Export.
module.exports = Note;