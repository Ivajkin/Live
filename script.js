
$$('#top .live').addEvent('click', function() {
	$$('#top .live').morph({
		"margin-left": 0,
		"margin-top": 0
	});
	$$('#bottom .live').morph({
		"margin-left": 0
	});
});
/*
$$('.sphere').addEvent('click', function() {
	var sa = [$$('.sphere .s1'), $$('.sphere .s2'), $$('.sphere .s3')];
	for(var i = 0; i < sa.length; ++i) {
		var s = sa[i];
		if(!s.__initialised__) {
			s.__initialised__ = true;
			s.velocity = [Math.random(), Math.random()];
		}
		var dtime = 1000/1;
		setInterval(function(s) {
			s.velocity[1] += 0.1*dtime;
			s.morph({"top": s.velocity[1]});
		}, dtime, s);
	}
});*/