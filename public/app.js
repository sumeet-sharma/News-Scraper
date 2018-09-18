$(document).ready(function() {
	
// Grab the articles as a json
$.getJSON("/articles", function(data) {
	// For each one
	for (var i = 0; i < data.length; i++) {
	  // Display the apropos information on the page
	  $("#articles").append("<article class='row' data-id='" + data[i]._id + "'>" + 
	  "<div class='col-xs-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 images'><img src='https://www.developer-tech.com" + data[i].thumbnail + "'></div>" +
	  "<div class='col-xs-12 col-sm-12 col-md-9 col-lg-9 col-xl-9 text'><h4>" + data[i].title + "</h4>" + 
	  "<p>" + data[i].summary + 
	  "<a href='https://www.developer-tech.com" + data[i].link + "' target='_blank'>Read More</a><br></p></div>" +
	  "</article>");
	}
  });
  
  
  // Whenever someone clicks a p tag
  $(document).on("click", "article", function() {
	// Empty the notes from the note section
	$("#notes").empty();
	// Save the id from the p tag
	var thisId = $(this).attr("data-id");
  
	// Now make an ajax call for the Article
	$.ajax({
	  method: "GET",
	  url: "/articles/" + thisId
	})
	  // With that done, add the note information to the page
	  .then(function(data) {
		// The title of the article
		$("#notes").append("<div class='currentNote col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'></div>");
		$(".currentNote").append("<p>This new note is for the following article:</p><h2>" + data.title + "</h2>");
		// An input to enter a new title
		$(".currentNote").append("<input id='titleinput' name='title' placeholder='Your Note Title'>");
		// A textarea to add a new note body
		$(".currentNote").append("<textarea id='bodyinput' name='body' placeholder='Your Note Text'></textarea>");
		// A button to submit a new note, with the id of the article saved to it
		$(".currentNote").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
		// A button to delete the note, with the id of the article saved to it
		$(".currentNote").append("<button class='delete' data-id='" + data.note._id + "' data-article-id='" + data._id + "'>Delete Note</button>");
  
		// If there's a note in the article
		if (data.note) {
		  // Place the title of the note in the title input
		  $("#titleinput").val(data.note.title);
		  // Place the body of the note in the body textarea
		  $("#bodyinput").val(data.note.body);
		}
	  });
  });
  
  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
	// Grab the id associated with the article from the submit button
	var thisId = $(this).attr("data-id");
  
	// Run a POST request to change the note, using what's entered in the inputs
	$.ajax({
	  method: "POST",
	  url: "/newNote/" + thisId,
	  data: {
		// Value taken from title input
		title: $("#titleinput").val(),
		// Value taken from note textarea
		body: $("#bodyinput").val()
	  }
	})
	  // With that done
	  .then(function(data) {
		// Log the response
		console.log(data);
		// Empty the notes section
		$("#notes").empty();
	  });
  
	// Also, remove the values entered in the input and textarea for note entry
	$("#titleinput").val("");
	$("#bodyinput").val("");
  });
  

  $(document).on("click", ".scrape-new", handleArticleScrape);

  function handleArticleScrape() {
    // This function handles the user clicking any "scrape new articles" button
    $.get("/scrape")
      .then(function(data) {
		alert("You have " + data.length + "new articles!");
		//This reloads the page after articles have been found
		window.location = '';
	  });
  }


$(document).on("click", ".delete", handleNoteDelete);

function handleNoteDelete() {
	//Grabbing both the article's id and the note's id here:
	var articleSelected = $(this).attr("data-article-id");
	var noteToDelete = $(this).attr("data-id");

	//Saving ids
	var ids = {
			noteId: noteToDelete,
			articleId: articleSelected
		};

	$.ajax({
		url: '/deleteNote/' + articleSelected,
		type: 'POST',
		data: ids,
		})
		// With that done
		.then(function(data) {
			// Log the response
			console.log(data);
			// Empty the notes section
			$("#notes").empty();
		  });
	window.location = '';
}









}); // End of Document Ready Function
