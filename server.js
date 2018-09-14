// =================== Dependencies =================== //

var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var request = require("request");
var cheerio = require("cheerio");
var logger = require("morgan");
var db = require("./models");

mongoose.Promise = Promise;

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

