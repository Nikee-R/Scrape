// =================== Dependencies =================== //

var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");
var path = require("path");
var moment = require("moment");

// For models.
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// For scraping.
var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;

// =================== PORTS =================== //

var PORT = process.env.PORT || 3000;

// Initialize express.
var app = express();

// =================== Middleware =================== //

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ 
    extended: false
}));

// Make public a static.
app.use(express.static("public"));

// Set handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");


// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Show errors in mongoose.
var db = mongoose.connection;

db.on("error", function(err) {
    console.log("Mongoose Error: ", err);
});

// Success message.
db.once("open", function() {
    console.log("Mongoose connect successful.");
});

// =================== Routes =================== //

// For default page.
app.get("/", function (req, res) {
    Article.find({"Saved": false}, function(err, data) {
        var hbsObject = {
            article: data
        };
        console.log(hbsObject);
        res.render("Homepage", hbsObject);
    });
});

app.get("/saved", function(req,res) {
    Article.find({"Saved": true}).populate("notes").exec(function(err, articles) {
        var hbsObject = {
            article: articles
        };
        res.render("Saved", hbsObject);
    });
});

// For scraping articles.
app.get("/scrape", function (req, res) {
    // Grabs from Science Daily website.
    request("https://www.sciencedaily.com/", function(error, response, html) {
    // Loads scrape into Cheerio.
    var $ = cheerio.load(html);

    $("#science_heroes").each(function(i, element) {

       var result = {}

       // Adds the title and summary of every link to an object.
       result.title = $(this).children("h3").text();
       result.summary = $(this).children(".hero-blurb").text();
       result.link = $(this).children(".col-xs-6").children("a").attr("href");

       // Uses Article model to create a new entry.
       var entry = new Article(result);

       // Saves in db.
       entry.save(function(err, doc) {
           // Logs errors.
           if (err) {
               console.log(err);
           } else {
               console.log(doc);
           }
        });

    });
        res.send("Scrape successful!");
     });
});


// For articles in database.
app.get("/articles", function(req, res) {

    Article.find({}, function(err, doc) {
        // Log errors.
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

// For grabbing articles by id.
app.get("/articles/:id", function(req, res) {

   Article.findOne({ "_id": req.params.id })
   .populate("note")
   .exec(function(err, doc) {
       // Log errors.
       if (err) {
           console.log(err);
       } else {
           res.json(doc);
       }
   });
});

// For saving articles.
app.post("/articles/save/:id", function(req, res) {
    Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
    .exec(function(err, doc) {
        // Log errors.
        if (err) {
            console.log(err);
        } else {
            res.send(doc);
        }
    });
});
    
// For deleting articles.
app.post("/articles/delete/:id", function(req, res) {

    Article.findByIdAndUpdate({ "_id": req.params.id }, {"saved": false, "notes": []})
    .exec(function(err, doc) {
        // Logs errors.
        if (err) {
            console.log(err);
        } else {
            res.send(doc);
        }
    });
});

// For creating a note.
app.post("/notes/save/:id", function(req, res) {
    var newNote = new Note({
        body: req.body.text,
        article: req.params.id
    });
    console.log(req.body);

    newNote.save(function(err, note) {
        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "notes": note } })
            .exec(function(err) {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send(note);
                }
            });
        }
    });
});

// For deleting a note.
app.delete("/notes/delete/:note_id/:article_id", function(req, res) {
    Note.findOneAndRemove({ "_id": req.params.note_id }, function(err) {
        // Logs errors.
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            db.Article.findByIdAndUpdate({ "_id": req.params.article_id }, {$pull: {"notes": req.params.note_id}})
            .exec(function(err) {
                // Logs errors.
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send("Note has been deleted.");
                }
            });
        }
    });
});

// Start server.
app.listen(PORT, function() {
    console.log("App running on port " + PORT + ".");
});
