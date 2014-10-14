var app = {
    
    initialize: function () {

        this.bindEvents();

    },

    bindEvents: function () {

        document.addEventListener("deviceready", this.onDeviceReady, false);

    },

    onDeviceReady: function () {

        app.receivedEvent("deviceready");

    },


    receivedEvent: function (id) {

        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector(".listening");
        var receivedElement = parentElement.querySelector(".received");

        listeningElement.setAttribute("style", "display: none;");
        receivedElement.setAttribute("style", "display: block;");

        console.log("Received Event: " + id);

    }

};



var loading_cachce, overlay_cache, options_cache, topbar_cache, feed_cache, overlay_current, current_image, feed_earlier, feed_next, feed_time_earliest, feed_time_latest, feed_time_interval;
var printer_current = 1;
var feed_source = "http://joyce.wayinhub.com/api/1/bites?feed=fd-2izo28udfb98h5vedmv&limit=100&format=json";



function photobooth_bind () {

	feed_cache.hammer().bind("tap", function() {

		event.preventDefault();
		photobooth_overlay("print", $(this));

	});

};



function photobooth_overlay (type, target) {

	overlay_current = type;

	if (type == "print") {

		current_image = target.attr("data-image");
		topbar_cache.find("#topbar-search").blur();
		overlay_cache.find("#print-image").css("background-image", "url(" + current_image + ")");
		overlay_cache.find("#print-text span").html(target.attr("data-username"));
		overlay_cache.find("#overlay-print").removeClass("invisible");

	}

	else if (type == "options") {

		overlay_cache.find("#overlay-options").removeClass("invisible");

	};

	overlay_cache.removeClass("invisible");

};



function photobooth_options () {

	options_cache.removeClass("invisible");

};



function photobooth_print () {

	loading_cache.removeClass("invisible");

	foo = "<img src='" + current_image + "' alt='' style='width: 100%; height: auto; border: none;' />";

	cordova.plugins.printer.print(foo, {}, function () {

    	loading_cache.addClass("invisible");
    	photobooth_close();

	});

};



function photobooth_close () {

	if (overlay_current == "print") {

		current_image = null;
		overlay_cache.find("#overlay-print").addClass("invisible");

	}

	else if (overlay_current == "options") {

		overlay_cache.find("#overlay-options").addClass("invisible");

	};

	overlay_cache.addClass("invisible");

};



function photobooth_search () {

	if (topbar_cache.find("#topbar-search").val() == "") {

		feed_cache.removeClass("invisible");
		return false;

	};

	filter = topbar_cache.find("#topbar-search").val();
	regex = new RegExp(filter, "i");

	feed_cache.each(function() {

		if ($(this).attr("data-username").search(regex) < 0) {

			$(this).addClass("invisible");
			
		}

		else {

			$(this).removeClass("invisible");

		};

	});

};



function photobooth_time () {

	clearInterval(feed_time_interval);

	function update () {

		console.log("updating timestamps");
		$("#bottombar #time-from").html(moment(feed_time_earliest).startOf("minute").fromNow());
		$("#bottombar #time-to").html(moment(feed_time_latest).startOf("minute").fromNow());

	};

	update();

	feed_time_interval = setInterval(function() {

		update();

	}, 30000);

};



function photobooth_printer (target) {

	printer_current = $(target).attr("data-printer");

	overlay_cache.find("#overlay-options #options-printers li.current").removeClass("current");
	$(target).addClass("current");

};



function photobooth_load (int, target) {

	loading_cache.removeClass("invisible");

	if (int == true) {

		source = feed_source;

	}

	else if (int == false) {

		source = target;

	};

	$.ajax({

		url: "http://tools.icgx.co/hkjc/getData.php?url=" + encodeURIComponent(source) + "?" + new Date().getTime(),
		type: "GET",
		dataType: "json",
		crossDomain: true,
		contentType: "application/json",
		success: function (data) {

			topbar_cache.find("#topbar-search").val("").blur();
			$("#feed #feed-list").empty();

			feed_earlier = data.contents.next_url;
			feed_time_earliest = data.contents.results[0].creation_time;
			feed_time_latest = data.contents.results[data.contents.results.length - 1].creation_time;

			photobooth_time();

			$("#feed #feed-list").empty();

			for (i = 0; i < data.contents.results.length; i++) {

				if (data.contents.results[i].type == "FACEBOOK_POST_ITEM") {

					image = data.contents.results[i].item.rss_post_media.url;
					username = data.contents.results[i].item.realname;
					type = "facebook";

				}

				else if (data.contents.results[i].type == "TWEET_ITEM") {

					image = data.contents.results[i].item.rss_post_media.url;

					if (image.slice(7, 20) == "pbs.twimg.com") {

						image = image + ":large";

					};

					username = data.contents.results[i].item.username.slice(1, data.contents.results[i].item.username.length);
					type = "twitter";

				}

				else {

					image = data.contents.results[i].item.images.standard_resolution.http_url;
					username = data.contents.results[i].item.user.username;
					type = "instagram";

				};

				$("#feed #feed-list").append("<li style='background-image: url(" + image + ");' data-image='" + image + "' data-username='" + username + "' class='" + type + "'><span></span></li>");

			};
			
		},
		
		error: function(xhr, status, error) {
			
			console.error("error");
			//alert("Error. Something may be wrong with the internet connection.");

		}
		
	}).done(function() {

		console.log("done");

		loading_cache.addClass("invisible");

		$("#feed").scrollTop(0);
		feed_cache = $("#feed #feed-list li");

		photobooth_bind();

	});

};



$(document).ready(function() {

	loading_cache = $("#loading");
	overlay_cache = $("#overlay");
	topbar_cache = $("#topbar");

	$("#overlay #overlay-confirm").hammer().bind("tap", photobooth_print);
	$("#topbar #topbar-search").on("input", photobooth_search);
	
	$("#topbar #topbar-options li").hammer().bind("tap", function() {

		event.preventDefault();
		photobooth_overlay("options", null);

	});

	$("#loading #loading-refresh").hammer().bind("tap", function() {

		location.reload();

	});

	$("#overlay #overlay-print #print-cancel, #overlay #overlay-options #options-close, #overlay #overlay-cover").hammer().bind("tap", function() {

		photobooth_close();

	});

	overlay_cache.find("#overlay-options #options-printers li").hammer().bind("tap", function() {

		photobooth_printer($(this));

	});

	$("#topbar #topbar-navigation #navigation-earlier").hammer().bind("tap", function() {

		photobooth_load(false, feed_earlier);

	});

	$("#topbar #topbar-navigation #navigation-latest").hammer().bind("tap", function() {

		photobooth_load(true, null);

	});

	photobooth_load(true, null);

});