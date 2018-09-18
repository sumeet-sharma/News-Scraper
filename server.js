// REQUIRING DEPENDENCIES
// ======================
	var express = require("express");
	var mongoose = require("mongoose");
	var bodyParser = require("body-parser");
	var logger = require("morgan");
	var mongojs = require("mongojs");



// SCRAPING TOOLS
// ==============
	// Axios is a promised-based http library,
	// similar to jQuery's Ajax method.
	// It works on the client and on the server
	var axios = require("axios");
	var cheerio = require("cheerio");


// REQUIRING ALL MODELS
// ====================
	var db = require("./models");


// SETTING UP OUR PORT
// ===================
	// Set up our port to be either the host's designated port, or 3000
	var PORT = process.env.PORT || 3000;


// EXPRESS APP
// ===========
	// Initialize Express
	var app = express();


// CONFIGURING MIDDLEWARE
// ======================
	// Use morgan logger for logging requests
	app.use(logger("dev"));
	// Use body-parser for handling form submissions
	app.use(bodyParser.urlencoded({ 
		extended: false 
	}));
	// Use express.static to serve the public folder as a static directory
	app.use(express.static("public"));

	// By default mongoose uses callbacks for async queries,
	// we're setting it to use promises (.then syntax) instead
	// Connect to the Mongo DB

	// If deployed, use the deployed database. Otherwise use local database.
	var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

	// Set mongoose to leverage built in JavaScript ES6 Promises
	// Connect to the Mongo DB
	mongoose.Promise = Promise;

	mongoose.connect(MONGODB_URI, {
		// useMongoClient: true
	});



// ===============
//	/	ROUTES	/
// ===============


// GET ROUTE FOR INDEX
// ===================
app.get("/", function(req, res) {
	// send us to the next get function instead.
	res.redirect("/index");
});

// GET ROUTE TO SCRAPE WEBSITE
// ===========================
app.get("/scrape", function(req, res) {
	// First, we grab the body of the html with request
	axios.get("https://www.developer-tech.com/news/").then(function(response) {
		// Load into cheerio and save it to $ for a shorthand selector
		var $ = cheerio.load(response.data);

		// Grab every h2 within an article tag, and do the following:
			$("article").each(function(i, element) {
			// Save an empty result object
			var result = {};

			// Add the title (h2), summary, and href (link) of every article, 
			// and save them as properties of the result object

				// ARTICLE HEADLINE / TITLE
				result.title = $(this).children("a").children("h2").text();
					console.log("Result.title: " + result.title);

				// ARTICLE LINK
				result.link = $(this).children("a").attr("href");
					console.log("Result Link: " + result.link);

				// ARTICLE SUMMARY
				result.summary = $(this)
				.children(".image_and_summary_wrapper")
				.children(".summary")
				.text();
					console.log("Result Summary: " + result.summary);

				// ARTICLE THUMBNAIL
				result.thumbnail = $(this)
				.children(".image_and_summary_wrapper")
				.children(".thumb")
				.children("img")
				.attr("src");
					console.log("Result Thumbnail: " + result.thumbnail);

			console.log("Entire result: " + JSON.stringify(result));

			console.log("db: " + JSON.stringify(db));
			console.log("Article: " + db.Article);

			// Create new Article using the `result` object built from scraping
			db.Article.create(result)
			.then(function(dbArticle) {
				// View the added result in the console
				console.log(dbArticle);
			})
			.catch(function(err) {
				// If an error occurred, send it to the client
				return res.json(err);
			});

		});

		// If we were able to successfully scrape and save an Article,
		// send a message to the client
		res.send("Scrape Complete");
	});
});


// GET ROUTE TO GET ALL ARTICLES FROM THE DB
// =========================================
app.get("/articles", function(req, res) {
	// Grab every document in the Articles collection
	db.Article.find({})
	.then(function(dbArticle) {
		// If we were able to successfully find Articles,
		// send them back to the client
		res.json(dbArticle);
	})
	.catch(function(err) {
		// If an error occurred, send it to the client
		res.json(err);
	});
});


// GET ROUTE TO GRAB SPECIFIC ARTICLE BY ID - POPULATE WITH IT'S NOTE
// ==================================================================
app.get("/articles/:id", function(req, res) {
	// Using the id passed in the id parameter,
	// prepare a query that finds the matching one in our db...
	db.Article.findOne({ _id: req.params.id })
	// ..and populate all of the notes associated with it
	.populate("note")
	.then(function(dbArticle) {
		// If we were able to successfully find an Article with the given id,
		// send it back to the client
		res.json(dbArticle);
	})
	.catch(function(err) {
		// If an error occurred, send it to the client
		res.json(err);
	});
});


// POST ROUTE TO SAVE/UPDATE AN ARTICLE'S NOTE
// ===========================================
app.post("/newNote/:id", function(req, res) {
	// Create a new note and pass the req.body to the entry
	db.Note.create(req.body)
	.then(function(dbNote) {
		// If a Note was created successfully,
		// find one Article with an `_id` equal to `req.params.id`.
		// Update the Article to be associated with the new Note
		// { new: true } tells the query that we want it to return the
		// updated User -- it returns the original by default
		// Since our mongoose query returns a promise, we can chain another
		// `.then` which receives the result of the query
		return db.Article.update(
			{_id: req.params.id},
			{note: dbNote._id},
			{new: true});
	})
	.then(function(dbArticle) {
		// If we were able to successfully update an Article,
		// send it back to the client
		res.json(dbArticle);
	})
	.catch(function(err) {
	// If an error occurred, send it to the client
	res.json(err);
	});
});


// POST ROUTE TO DELETE AN ARTICLE'S NOTE
// ======================================
app.post("/deleteNote/:id", function(req, res) {
	//GET the id of note we wish to delete here:
	var {articleId, noteId} = req.body;
	var noteIdRaw = req.body.noteId;
	db.Note.remove(
			{ _id: noteIdRaw}
		)
	.then(function(dbNote) {
		// If we were able to successfully find Articles,
		// send them back to the client
		res.json(dbNote);
	})
	.catch(function(err) {
		// If an error occurred, send it to the client
		res.json(err);
	});
});



// ===================
// STARTING THE SERVER
// ===================
	app.listen(PORT, function() {
		console.log("\n==> 🌎  Listening on port %s." +
		"Visit http://localhost:%s/ in your browser.", PORT, PORT);
	});
