
$$('#top .live').addEvent('click', function() {
	$$('#top .live').morph({
		"margin-left": 0,
		"margin-top": 0
	});
	$$('#bottom .live').morph({
		"margin-left": 0
	});
});

/*$$('.sphere').addEvent('click', function() {
	var s = [$$('.sphere .s1'), $$('.sphere .s2'), $$('.sphere .s3')];
	s.forEach(function(s) {
		if(!s.__initialised__) {
			s.__initialised__ = true;
			s.velocity = [Math.random(), Math.random()];
		}
		var dtime = 1000/30;
		setInterval(function(s) {
			s.velocity[1] += 0.1*dtime;
			s.morph({top: s.velocity[1]});
		}, dtime, s);
	});
});*/