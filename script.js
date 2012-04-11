
$$('#top .live').addEvent('click', function() {
	$$('#top .live').morph({
		"margin-left": 0,
		"margin-top": 0
	});
	$$('#bottom .live').morph({
		"margin-left": 0
	});
});