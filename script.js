function lights(on) {
	$$('.live').set('morph', {duration: 0});
	$$('.live').morph({
		'color': (on ? '#fff' : '#000')
	});
}

function runEvents(events) {
	if(events.length > 0) {
		var time = events[0][0],
			event = events[0][1];
		events.shift();
		
		setTimeout(function(event, events) {
			event();
			runEvents(events);
		}, time, event, events);
	}
}


$$('.live').addEvent('click', function() {
	$$('.live').morph({
		"margin-top": 0
	});
	$$('.live').removeEvents('mouseover');
	$$('.live').removeEvents('mouseout');
	
	runEvents([
		[600, function() {lights(true)}],
		[200, function() {lights(false)}],
		[500, function() {lights(true)}],
		[200, function() {lights(false)}],
		[200, function() {lights(true)}],
		[150, function() {lights(false)}],
		[150, function() {lights(true)}]
	]);
});

function fadeLiveOpacityEvent(event, opacity) {

	$$('.live').addEvent(event, function() {
		$('dark-background').morph({
			"opacity": opacity
		});
	});
}
fadeLiveOpacityEvent('mouseover', 1);
fadeLiveOpacityEvent('mouseout', 0);



$$('.sphere.s3').addEvent('click', function() {
	window.open("background-clouds-dark-23.04.2012.jpg");
});
$$('.sphere.s2').addEvent('click', function() {
	window.open("background-clouds-23.04.2012.jpg");
});

$$('.sphere.s1').addEvent('click', function() {
	$$('.sphere.s1').morph({
		"height": '250px'
	});
});