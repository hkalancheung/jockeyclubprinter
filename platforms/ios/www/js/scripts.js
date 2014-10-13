/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};



var loading_cachce, overlay_cache, topbar_cache, feed_cache, current_image, feed_previous, feed_next;



function photobooth_bind () {

	feed_cache.hammer().bind("tap", function() {

		event.preventDefault();
		photobooth_overlay($(this));

	});

};



function photobooth_overlay (target) {

	current_image = target.attr("data-image");

	topbar_cache.find("#topbar-search").blur();

	overlay_cache.find("#overlay-image").css("background-image", "url(" + current_image + ")");
	overlay_cache.find("#overlay-text span").html(target.attr("data-username"));
	overlay_cache.removeClass("invisible");

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

	current_image = null;
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



function photobooth_load (int, target) {

	loading_cache.removeClass("invisible");
	topbar_cache.find("#topbar-search").val("").blur();
	$("#feed #feed-list").empty();

	if (int == true) {

		source = "lib/data.json";

	}

	else {

		source = target;

	};

	$.ajax({

		url: source + "?" + new Date().getTime(),
		type: "GET",
		dataType: "json",
		crossDomain: true,
		contentType: "application/json",
		success: function (data) {

			feed_previous = data.prev_url;
			feed_next = data.next_url;

			$("#feed #feed-list").empty();

			for (i = 0; i < data.results.length; i++) {

				if (data.results[i].type == "FACEBOOK_POST_ITEM") {

					image = data.results[i].item.entry_graph.body.images[0];
					username = data.results[i].item.username;
					type = "facebook";

				}

				else if (data.results[i].type == "TWEET_ITEM") {

					image = data.results[i].item.media.media_url;
					username = data.results[i].item.username.slice(1, data.results[i].item.username.length);
					type = "twitter";

				}

				else {

					image = data.results[i].item.images.standard_resolution.http_url;
					username = data.results[i].item.user.username;
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

		feed_cache = $("#feed #feed-list li");

		photobooth_bind();

	});

};



$(document).ready(function() {

	loading_cache = $("#loading");
	overlay_cache = $("#overlay");
	topbar_cache = $("#topbar");

	photobooth_load(true);

	$("#overlay #overlay-cancel, #overlay #overlay-cover").hammer().bind("tap", photobooth_close);
	$("#overlay #overlay-confirm").hammer().bind("tap", photobooth_print);
	$("#topbar #topbar-search").on("input", photobooth_search);
	$("#topbar #topbar-refresh").hammer().bind("tap", photobooth_load);

	$("#topbar #topbar-tools #topbar-previous").hammer().bind("tap", function() {

		photobooth_load(false, feed_previous);

	});

	$("#topbar #topbar-tools #topbar-next").hammer().bind("tap", function() {

		photobooth_load(false, feed_next);

	});

});