// Scrape Functionality
$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
        window.location = "/"
    })
});

// Navigation.
$(".navbar-nav li").click(function() {
    $(".navbar-nav li").removeClass("active");
    $(this).addClass("active");
});

// Save article button.
$(".save").on("click", function() {
    var thisID = $(this).attr("data-id");
    $.ajaz({
        method: "POST",
        url: "/saved/" + thisId
    }).done(function(data) {
        window.location = "/"
    })
});

// Save note button.
$(".saveNote").on("click", function() {
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("Please enter note to save.")
    } else {
        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                text: $("#noteText" + thisId).val()
            }
        }).done(function(data) {
            console.log(data);

            // Clear.
            $("#noteText" + thisId).val("");
            $(".modalNote").modal("hide");
            window.location = "/saved"
        });
    }
});

// Delete note.
$(".deleteNote").on("click", function() {
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/delete" + noteId + "/" + articleId
    }).done(function(data) {
        console.log(data)
        $(".modalNote").modal("hide");
        window.location = "/articles"
    })
});


