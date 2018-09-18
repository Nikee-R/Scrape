
var mongoose = require("mongoose");

// Creates Schema.
var Schema = mongoose.Schema;

// Create note schema.
var NoteSchema = new Schema({
   title: String,
   body: String
});

// Create note model.
var Note = mongoose.model("Note", NoteSchema);

// Export.
module.exports = Note;