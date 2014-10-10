function photobooth_bind () {

	$("#feed a").bind("click", function() {

		event.preventDefault();
		photobooth_overlay($(this).attr("href"));

	});

};




function photobooth_overlay (target) {

	$("#overlay #overlay-image").css("background-image", "url(" + target + ")");
	$("#overlay").removeClass("invisible");


};



function photobooth_close () {

	$("#overlay").addClass("invisible");

};









$(document).ready(function() {

	photobooth_bind();

	$("#overlay #overlay-cancel a").bind("click", function() {

		photobooth_close();

	});

});