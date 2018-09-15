// =================== Dependencies =================== //

var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");
var db = require("./models");
var path = require("path");

// For models.
var Note = require("./models/note.js");
var Article = require("./models/article.js");

// For scraping.
var request = require("request");
var cheerio = require("cheerio");

// =================== PORTS =================== //

var port = process.env.PORT || 3000;

// Initialize express.
var app = express();

// =================== Middleware =================== //

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static("public"));

// =================== Routes =================== //

// For default page.
app.get("/", function (req, res) {
    res.send(index.html);
});

// For scraping articles.
app.get("/scrape", function (req, res) {
    request("https://www.sciencedaily.com/", function(err, res, html) {

    var $ = cheerio.load(html);

    $(".title-link").each(function(i, element) {

        var title = $(element).children().text();
        var link = $(element).attr("href");
        var snippet = $(element).siblings("p").text().trim();
        var created = moment().format("YYYY MM DD hh:mm:ss");

        var result = {
            title: title,
            link: link,
            snippet: snippet,
            created: created,
            isSaved: false
        }

        console.log(result);

        db.Article.findOne({title:title}).then(function(data) {
            console.log(data);

            if (data === null) {

                db.Article.create(result).then(function(dbArticle) {
                    res.json(dbArticle);
                });
            }
        }).catch(function(err) {
            res.json(err);
        });
    });
});
});

// For articles in database.
app.get("/articles", function(req, res) {

    db.Article
    .find({})
    .sort({created: -1})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// For grabbing articles by id.
app.get("/articles/:id", function(req, res) {

    dbArticle.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// For saving articles associated to note.
app.post("/articles/:id", function(req, res) {

    db.Note
    .create(req.body)
    .then(function(dbNote) {
        res.json(dbArticle);
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// For saving articles.
app.put("/saved/:id", function(req, res) {

    db.Article
    .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true }})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// For getting saved articles.
app.get("/saved", function(req, res) {

    db.Article.find({ isSaved: true })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .cathc(function(err) {
        res.json(err);
    });
});

// For deleting saved articles.
app.put("/delete/:id", function(req, res) {

    db.Article
    .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false }})
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


// Start server.
app.listen(PORT, function() {
    console.log("App running on port " + PORT + ".");
});